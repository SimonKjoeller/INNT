import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { getDatabase, ref, get, query, orderByChild, equalTo } from 'firebase/database';
import Icon from 'react-native-vector-icons/Ionicons';
import { firebaseApp } from '../database/firebase';
import { libraryStyles } from '../styles/libraryStyles';
import GameListItem from './GameListItem';
import { useAuth } from './Auth';
import { useFocusEffect } from '@react-navigation/native';

const WantToPlayList = ({ navigation, userId, sortMode = 'added_desc' }) => {
    const [wishlistGames, setWishlistGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const effectiveUserId = useMemo(() => userId || user?.uid || null, [userId, user]);

    useEffect(() => {
        fetchWishlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveUserId]);

    // Re-sort when sortMode changes
    useEffect(() => {
        setWishlistGames(prev => {
            const copy = [...prev];
            copy.sort((a, b) => {
                const diff = new Date(a.added_timestamp) - new Date(b.added_timestamp);
                return sortMode === 'added_asc' ? diff : -diff;
            });
            return copy;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortMode]);

    // Refetch when Library screen gains focus (e.g., user taps bottom tab or returns from game)
    useFocusEffect(
        useCallback(() => {
            fetchWishlist();
        }, [effectiveUserId])
    );

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const database = getDatabase(firebaseApp);
            if (!effectiveUserId) {
                setWishlistGames([]);
                return;
            }

            // Hent wishlist for brugeren (per-user path)
            const wishlistRef = ref(database, `users/${effectiveUserId}/wishlist`);
            const wishlistSnapshot = await get(wishlistRef);

            if (wishlistSnapshot.exists()) {
                const wishlistData = wishlistSnapshot.val();
                const wishlistArray = Object.keys(wishlistData).map(key => ({
                    // Tilføj Firebase key som felt for navigation og identifikation
                    ...wishlistData[key],
                    wishlistKey: key
                }));

                // Hent kun de spil som findes i wishlisten (undgår at hente hele 'games' tabellen)
                // Vi henter disse da vi skal bruge mere spildata for at vise i listen
                const gamesRef = ref(database, 'games');
                const uniqueIds = [...new Set(wishlistArray.map(w => w.game_id))];

                // Parallelle forespørgsler pr. unik game_id
                const gameFetchPromises = uniqueIds.map(id =>
                    get(query(gamesRef, orderByChild('id'), equalTo(id)))
                );

                // i gameSnapshots har vi nu en array af snapshots for hvert spil
                const gameSnapshots = await Promise.all(gameFetchPromises);

                // Byg map fra internal id -> { firebaseKey, data }
                // dette gør det nemt at merge senere
                // her der sørger vi for at hente firebaseKey og data for hvert spil
                const gamesById = {};
                gameSnapshots.forEach(snap => {
                    if (snap.exists()) {
                        snap.forEach(child => {
                            const gd = child.val();
                            if (gd && gd.id != null) {
                                gamesById[gd.id] = { firebaseKey: child.key, data: gd };
                            }
                        });
                    }
                });

                // Merge spil-data først, så wishlist-itemets egne felter (fx. tilføjelses-timestamp) bevares
                const enrichedWishlist = wishlistArray.map(wishlistItem => {
                    const match = gamesById[wishlistItem.game_id];
                    if (!match) {
                        console.warn(`Game not found for ID: ${wishlistItem.game_id}`);
                        return null;
                    }
                    const { firebaseKey, data: gameData } = match;
                    return {
                        ...gameData,        // spillets data først
                        ...wishlistItem,    // wishlist-item overskriver ved konflikt
                        firebaseKey,        // Firebase key for navigation
                        gameId: wishlistItem.game_id,
                    };
                }).filter(item => item !== null);

                // Sorter efter added_timestamp
                enrichedWishlist.sort((a, b) => {
                    const diff = new Date(a.added_timestamp) - new Date(b.added_timestamp);
                    return sortMode === 'added_asc' ? diff : -diff;
                });

                setWishlistGames(enrichedWishlist);
            } else {
                setWishlistGames([]);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setWishlistGames([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGamePress = (game) => {
        navigation.navigate('RateGame', { gameId: game.firebaseKey });
    };

    const renderEmptyState = () => (
        <View style={libraryStyles.emptyContainer}>
            <Icon
                name="bookmark-outline"
                size={64}
                color="#444444"
                style={libraryStyles.emptyIcon}
            />
            <Text style={libraryStyles.emptyTitle}>
                Ingen spil i din ønskelist
            </Text>
            <Text style={libraryStyles.emptySubtitle}>
                Spil du tilføjer til din ønskelist vil vises her.{'\n'}
                Find spil på forsiden eller søg efter dem!
            </Text>
        </View>
    );

    const renderGameItem = ({ item }) => (
        <GameListItem
            game={item}
            type="wishlist"
            onPress={handleGamePress}
            showAddedDate={true}
        />
    );

    if (loading) {
        return (
            <View style={libraryStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text style={libraryStyles.loadingText}>
                    Indlæser ønskeliste...
                </Text>
            </View>
        );
    }

    return (
        <View style={libraryStyles.contentContainer}>
            {wishlistGames.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={wishlistGames}
                    renderItem={renderGameItem}
                    keyExtractor={(item) => item.wishlistKey}
                    contentContainerStyle={libraryStyles.gamesList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default WantToPlayList;
