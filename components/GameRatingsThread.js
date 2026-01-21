import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ref, get, query, orderByChild, equalTo, set } from 'firebase/database';
import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../database/firebase';
import { gameRatingsStyles } from '../styles/gameRatingsStyles';
import { useFocusEffect } from '@react-navigation/native';

const formatRatingToStars = (rating) => {
    const num = Number(rating) || 0;
    const normalized = Math.round((num / 10) * 5);
    return new Array(5).fill(null).map((_, i) => (
        <Icon
            key={i}
            name={i < normalized ? 'star' : 'star-outline'}
            size={14}
            color="#FFD700"
        />
    ));
};

const formatDate = (ts) => {
    if (!ts) return '';
    try {
        const d = new Date(ts);
        return d.toLocaleDateString('da-DK', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
        return '';
    }
};

// Component to display community ratings with comments for a specific game
const GameRatingsThread = ({ gameInternalId, currentUserId, includeSelf = true }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortMode, setSortMode] = useState('newest'); // 'newest' | 'up' | 'down'
    const [visibleCount, setVisibleCount] = useState(3);

    const fetchRatingsWithComments = useCallback(async () => {
        try {
            setLoading(true);
            if (gameInternalId == null) {
                setItems([]);
                return;
            }

            const ratingsRef = ref(db, 'userRatings');

            // Forsøg med flere mulige id-formater for robusthed (tal og string af det interne id)
            const candidateEqualTo = [];
            const asNumber = Number(gameInternalId);
            if (!Number.isNaN(asNumber)) candidateEqualTo.push(asNumber);
            candidateEqualTo.push(String(gameInternalId));

            console.log('[Community] fetch start', {
                gameInternalId,
                candidates: candidateEqualTo,
            });

            let collected = [];
            for (const val of candidateEqualTo) {
                try {
                    const q = query(ratingsRef, orderByChild('game_id'), equalTo(val));
                    const snap = await get(q);
                    if (snap.exists()) {
                        const raw = snap.val();
                        const arr = Object.keys(raw).map((key) => ({ key, ...raw[key] }));
                        console.log('[Community] candidate match', { val, count: arr.length });
                        collected = collected.concat(arr);
                    }
                } catch (inner) {
                    // ignore per-attempt errors; fall back to others
                }
            }

            if (collected.length === 0) {
                // Fallback: fuld scan og filter client-side (robust mod type/struktur forskelle)
                try {
                    const allSnap = await get(ratingsRef);
                    if (allSnap.exists()) {
                        const allRaw = allSnap.val();
                        const allArr = Object.keys(allRaw).map((key) => ({ key, ...allRaw[key] }));
                        const idSet = new Set(candidateEqualTo.map(String));
                        collected = allArr.filter(r => idSet.has(String(r.game_id)));
                        console.log('[Community] fallback scan match', collected.length);
                    }
                } catch { }
                if (collected.length === 0) {
                    setItems([]);
                    return;
                }
            }

            // Kun ratings med kommentar (ikke tom/whitespace)
            // Dedup på ratingKey
            const dedupMap = {};
            collected.forEach(r => { dedupMap[r.key] = r; });
            const unique = Object.values(dedupMap);

            const withComments = unique.filter(r => typeof r.comment === 'string' && r.comment.trim().length > 0);

            // Hent votes for hver rating
            const voteSnaps = await Promise.all(withComments.map(r => get(ref(db, `ratingVotes/${r.key}`))));
            const keyToVotes = {};
            withComments.forEach((r, idx) => {
                const s = voteSnaps[idx];
                keyToVotes[r.key] = s.exists() ? s.val() : {};
            });

            // Hent displayName for unikke user_ids
            const uniqueUserIds = [...new Set(withComments.map(r => r.user_id))];
            const userSnaps = await Promise.all(uniqueUserIds.map(uid => get(ref(db, `users/${uid}`))));
            const uidToName = {};
            userSnaps.forEach((us, idx) => {
                const uid = uniqueUserIds[idx];
                if (us.exists()) {
                    const u = us.val();
                    uidToName[uid] = u?.displayName || 'Anonymous';
                } else {
                    uidToName[uid] = 'Anonymous';
                }
            });

            // Berig, ekskluder evt. egen rating fra tråden (så man ikke ser den to steder)
            const enriched = withComments
                .filter(r => includeSelf ? true : (r.user_id !== currentUserId))
                .map(r => ({
                    ...r,
                    displayName: r.user_id === currentUserId ? 'You' : (uidToName[r.user_id] || 'Anonymous'),
                    upvotes: Object.values(keyToVotes[r.key] || {}).filter(v => v === 1).length,
                    downvotes: Object.values(keyToVotes[r.key] || {}).filter(v => v === -1).length,
                    userVote: keyToVotes[r.key] && currentUserId ? (keyToVotes[r.key][currentUserId] || 0) : 0,
                }))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            setItems(enriched);
            console.log('[Community] enriched count', enriched.length);
        } catch (e) {
            console.error('Error fetching community ratings:', e);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [gameInternalId, currentUserId]);

    useEffect(() => {
        fetchRatingsWithComments();
    }, [fetchRatingsWithComments]);

    useFocusEffect(
        useCallback(() => {
            fetchRatingsWithComments();
        }, [fetchRatingsWithComments])
    );

    const applySorting = useCallback((list) => {
        if (sortMode === 'newest') {
            return [...list].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
        if (sortMode === 'up') {
            return [...list].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        }
        if (sortMode === 'down') {
            // Sort strictly by number of downvotes (desc), then fewer upvotes, then newest
            return [...list].sort((a, b) => {
                const primary = (b.downvotes || 0) - (a.downvotes || 0);
                if (primary !== 0) return primary;
                const secondary = (a.upvotes || 0) - (b.upvotes || 0);
                if (secondary !== 0) return secondary;
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
        }
        return list;
    }, [sortMode]);

    const sortedItems = applySorting(items);

    const handleVote = async (ratingKey, direction) => {
        if (!currentUserId) return;
        try {
            const path = ref(db, `ratingVotes/${ratingKey}/${currentUserId}`);
            const current = items.find(i => i.key === ratingKey)?.userVote || 0;
            const next = current === direction ? 0 : direction; // toggle
            await set(path, next === 0 ? null : next);

            // Optimistisk opdatering
            setItems(prev => prev.map(it => {
                if (it.key !== ratingKey) return it;
                let up = it.upvotes;
                let down = it.downvotes;
                if (current === 1) up -= 1;
                if (current === -1) down -= 1;
                if (next === 1) up += 1;
                if (next === -1) down += 1;
                return { ...it, userVote: next, upvotes: up, downvotes: down };
            }));
        } catch (e) {
            console.error('Error voting on rating:', e);
        }
    };

    const renderItem = ({ item }) => (
        <View style={gameRatingsStyles.itemContainer}>
            <View style={gameRatingsStyles.itemHeader}>
                <Text style={gameRatingsStyles.displayName} numberOfLines={1} ellipsizeMode="tail">{item.displayName}</Text>
                <Text style={gameRatingsStyles.timestamp}>{formatDate(item.timestamp)}</Text>
            </View>
            <View style={gameRatingsStyles.starsRow}>
                {formatRatingToStars(item.rating)}
                <Text style={gameRatingsStyles.numericRating}>{Number(item.rating).toFixed(1)}/10</Text>
            </View>
            <Text style={gameRatingsStyles.commentText}>{item.comment}</Text>
            <View style={gameRatingsStyles.voteRow}>
                <TouchableOpacity
                    style={[gameRatingsStyles.voteButton, item.userVote === 1 && gameRatingsStyles.voteButtonUpActive]}
                    onPress={() => handleVote(item.key, 1)}
                    activeOpacity={0.7}
                >
                    <Icon name={item.userVote === 1 ? 'thumbs-up' : 'thumbs-up-outline'} size={16} color={item.userVote === 1 ? '#4CAF50' : '#aaa'} />
                    <Text style={[gameRatingsStyles.voteCount, item.userVote === 1 && gameRatingsStyles.voteCountUpActive]}>{item.upvotes}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[gameRatingsStyles.voteButton, item.userVote === -1 && gameRatingsStyles.voteButtonDownActive]}
                    onPress={() => handleVote(item.key, -1)}
                    activeOpacity={0.7}
                >
                    <Icon name={item.userVote === -1 ? 'thumbs-down' : 'thumbs-down-outline'} size={16} color={item.userVote === -1 ? '#E57373' : '#aaa'} />
                    <Text style={[gameRatingsStyles.voteCount, item.userVote === -1 && gameRatingsStyles.voteCountDownActive]}>{item.downvotes}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={gameRatingsStyles.loadingContainer}>
                <ActivityIndicator size="small" color="#888" />
                <Text style={gameRatingsStyles.loadingText}>Indlæser kommentarer...</Text>
            </View>
        );
    }

    if (!items || items.length === 0) {
        return (
            <View style={gameRatingsStyles.emptyContainer}>
                <Icon name="chatbubble-ellipses-outline" size={18} color="#777" />
                <Text style={gameRatingsStyles.emptyText}>Ingen kommentarer endnu</Text>
            </View>
        );
    }

    return (
        <View style={gameRatingsStyles.container}>
            <Text style={gameRatingsStyles.sectionTitle}>Community ratings</Text>
            <View style={gameRatingsStyles.filterBar}>
                <TouchableOpacity
                    style={[gameRatingsStyles.filterButton, sortMode === 'newest' && gameRatingsStyles.filterButtonActive]}
                    onPress={() => setSortMode('newest')}
                    activeOpacity={0.7}
                >
                    <Text style={[gameRatingsStyles.filterText, sortMode === 'newest' && gameRatingsStyles.filterTextActive]} numberOfLines={1}>Newest</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[gameRatingsStyles.filterButton, sortMode === 'up' && gameRatingsStyles.filterButtonActive]}
                    onPress={() => setSortMode('up')}
                    activeOpacity={0.7}
                >
                    <Text style={[gameRatingsStyles.filterText, sortMode === 'up' && gameRatingsStyles.filterTextActive]} numberOfLines={1}>Upvoted</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[gameRatingsStyles.filterButton, sortMode === 'down' && gameRatingsStyles.filterButtonActive]}
                    onPress={() => setSortMode('down')}
                    activeOpacity={0.7}
                >
                    <Text style={[gameRatingsStyles.filterText, sortMode === 'down' && gameRatingsStyles.filterTextActive]} numberOfLines={1}>Downvoted</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={sortedItems.slice(0, visibleCount)}
                keyExtractor={(item) => item.key}
                renderItem={renderItem}
                scrollEnabled={false}
                contentContainerStyle={gameRatingsStyles.listContent}
                showsVerticalScrollIndicator={false}
            />
            {visibleCount < sortedItems.length && (
                <TouchableOpacity
                    style={gameRatingsStyles.loadMoreButton}
                    onPress={() => setVisibleCount(v => Math.min(v + 3, sortedItems.length))}
                    activeOpacity={0.7}
                >
                    <Text style={gameRatingsStyles.loadMoreText}>Se flere</Text>
                </TouchableOpacity>
            )}
            {sortedItems.length > 3 && visibleCount >= sortedItems.length && (
                <TouchableOpacity
                    style={gameRatingsStyles.loadMoreButton}
                    onPress={() => setVisibleCount(3)}
                    activeOpacity={0.7}
                >
                    <Text style={gameRatingsStyles.loadMoreText}>Se færre</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default GameRatingsThread;


