import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, ScrollView, Modal, TextInput, Dimensions, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

import { ref, child, get, set, update, query, orderByChild, equalTo, push, limitToLast } from 'firebase/database';
import sessionCache from '../caching/sessionCache';


import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../database/firebase';
import styles from '../styles/screenStyles';
import { rateGameComponentStyles, rateGameStyles } from '../styles/RateGameStyles';
import GameRatingsThread from './GameRatingsThread';
import { useAuth } from './Auth';


const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.getFullYear();
};

const getGameInternalId = (gameData, gameIdStr) => {
    return gameData?.id || gameIdStr;
};

// Ensure consistent type for ratings' game_id: prefer number when numeric, else string (firebase key)
const getNormalizedGameIdForRatings = (gameData, gameIdStr) => {
    const raw = gameData?.id ?? gameIdStr;
    const asNum = Number(raw);
    if (Number.isFinite(asNum)) return asNum;
    return String(raw);
};

const formatRating = (rating) => {
    // Round to nearest 0.5
    return Math.round(rating * 2) / 2;
};

const createLoadingView = (message = "Loading...") => (
    <View style={rateGameStyles.loadingContainer}>
        <Text style={rateGameStyles.loadingText}>{message}</Text>
    </View>
);

// ===== GAME LIST COMPONENT =====
export const RateGameList = ({ navigation }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGames();
    }, []);

    // Hent kun et begrænset sæt af spil (fx top 50 efter reviewCount) for at undgå at downloade hele databasen på mount.
    const fetchGames = async () => {
        try {
            const gamesRef = ref(db, 'games');
            // Hent de 50 spil med flest anmeldelser (Firebase returnerer stigende rækkefølge -> brug limitToLast)
            const topQuery = query(gamesRef, orderByChild('reviewCount'), limitToLast(50));

            const snapshot = await get(topQuery);

            if (snapshot.exists()) {
                const gamesArray = [];
                snapshot.forEach(childSnapshot => {
                    const gameData = childSnapshot.val();
                    gamesArray.push({
                        // Gem firebase-nøglen som id for navigation/unik identifikation
                        id: childSnapshot.key,
                        firebaseKey: childSnapshot.key,
                        ...gameData
                    });
                });

                // Vend rækkefølgen så de mest anmeldte vises først
                gamesArray.reverse();

                setGames(gamesArray);
            } else {
                // Intet at vise — vis besked eller tom liste
                setGames([]);
                // Behold Alert hvis du vil informere brugeren:
                // Alert.alert('Info', 'No games found in database');
            }
        } catch (error) {
            console.error('Error fetching games:', error);
            Alert.alert('Error', 'Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const handleGameSelect = (gameId) => {
        console.log('[NAVIGATE] RateGame -> gameId:', gameId);
        navigation.navigate('RateGame', { gameId });
    };

    const renderGameItem = ({ item }) => (
        <TouchableOpacity
            style={rateGameComponentStyles.gameItem}
            onPress={() => handleGameSelect(item.id)}
        >
            <Image
                source={{ uri: item.coverUrl }}
                style={rateGameComponentStyles.gameCover}
                resizeMode="cover"
            />
            <View style={rateGameComponentStyles.gameInfo}>
                <Text style={rateGameComponentStyles.gameName}>{item.name}</Text>
                <Text style={rateGameComponentStyles.gameYear}>
                    {formatDate(item.first_release_date)}
                </Text>
                <Text style={rateGameComponentStyles.gameReviews}>
                    {item.reviewCount || 0} reviews
                </Text>
            </View>
            <Text style={rateGameComponentStyles.arrow}>→</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return createLoadingView("Loading games...");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎮 Games to Rate</Text>
            <Text style={rateGameComponentStyles.subtitle}>Tap on a game to rate it</Text>

            <FlatList
                data={games}
                keyExtractor={(item) => item.id}
                renderItem={renderGameItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={rateGameComponentStyles.listContainer}
            />
        </View>
    );
};

// ===== RATING MODAL COMPONENT =====
const RatingModal = ({ visible, onClose, gameData, onSubmitRating, existingRating }) => {
    const [rating, setRating] = useState(existingRating?.rating || 5.0);
    const [comment, setComment] = useState(existingRating?.comment || '');

    // Opdater state når existingRating ændres
    useEffect(() => {
        if (existingRating) {
            setRating(existingRating.rating);
            setComment(existingRating.comment || '');
        } else {
            setRating(5.0);
            setComment('');
        }
    }, [existingRating]);

    const handleRatingChange = (newRating) => {
        setRating(newRating);
        // Subtil haptic feedback ved rating ændring
        Haptics.selectionAsync();
    };

    const handleSubmit = () => {
        onSubmitRating(rating, comment);
        onClose();
    };

    const handleOverlayPress = () => {
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={rateGameStyles.modalOverlay}
                onPress={handleOverlayPress}
                activeOpacity={1}
            >
                <TouchableOpacity
                    style={rateGameStyles.modalContainer}
                    onPress={() => { }}
                    activeOpacity={1}
                >
                    <Text style={rateGameStyles.modalTitle}>
                        {existingRating ? `Update Rating for ${gameData?.name}` : `Rate ${gameData?.name}`}
                    </Text>

                    <Text style={rateGameStyles.ratingLabel}>Rating: {formatRating(rating).toFixed(1)}/10</Text>
                    <View style={rateGameStyles.sliderContainer}>
                        <Text style={rateGameStyles.sliderLabel}>0</Text>
                        <Slider
                            style={rateGameStyles.slider}
                            minimumValue={0}
                            maximumValue={10}
                            value={rating}
                            onValueChange={handleRatingChange}
                            step={0.5}
                            minimumTrackTintColor="#FFD700"
                            maximumTrackTintColor="#666"
                            thumbStyle={rateGameStyles.sliderThumb}
                        />
                        <Text style={rateGameStyles.sliderLabel}>10</Text>
                    </View>

                    <Text style={rateGameStyles.commentLabel}>Comment (optional):</Text>
                    <TextInput
                        style={rateGameStyles.commentInput}
                        value={comment}
                        onChangeText={setComment}
                        placeholder="What did you think about this game?"
                        placeholderTextColor="#666"
                        multiline={true}
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <View style={rateGameStyles.modalButtons}>
                        <TouchableOpacity
                            style={rateGameStyles.modalButtonCancel}
                            onPress={onClose}
                        >
                            <Text style={rateGameStyles.modalButtonTextCancel}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={rateGameStyles.modalButtonSubmit}
                            onPress={handleSubmit}
                        >
                            <Text style={rateGameStyles.modalButtonTextSubmit}>
                                {existingRating ? 'Update Rating' : 'Submit Rating'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

// ===== GAME DETAIL COMPONENT =====
export const RateGameDetail = ({ gameId, navigation }) => {
    const gameIdStr = String(gameId);
    const [gameData, setGameData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [isOnWishlist, setIsOnWishlist] = useState(false);
    const [wishlistKey, setWishlistKey] = useState(null);
    const [existingRating, setExistingRating] = useState(null);
    const [isPlayed, setIsPlayed] = useState(false);
    const [playedKey, setPlayedKey] = useState(null);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [artworkRatios, setArtworkRatios] = useState({}); // uri -> (height/width)
    const { user } = useAuth();
    const currentUserId = user?.uid || null;

    const screenWidth = Dimensions.get('window').width;

    const getPrimaryCompany = (data) => {
        if (!data) return null;
        const ensureString = (val) => {
            if (!val) return null;
            if (typeof val === 'string') return val;
            if (typeof val === 'object') return val.name || null;
            return null;
        };
        const candidates = [
            ensureString(data.developer),
            Array.isArray(data.developers) ? ensureString(data.developers[0]) : null,
            ensureString(data.publisher),
            Array.isArray(data.publishers) ? ensureString(data.publishers[0]) : null,
        ].filter(Boolean);
        return candidates[0] || null;
    };

    const getHeaderHeightFromArtwork = (url) => {
        if (!url) return null;
        try {
            const matchToken = url.match(/t_([^/]+)/);
            const token = matchToken ? matchToken[1] : null;
            if (!token) return null;
            // Handle common tokens like 720p/1080p → 16:9
            const pMatch = token.match(/^(\d{3,4})p$/);
            if (pMatch) {
                const aspect = 9 / 16; // standard 16:9
                return screenWidth * aspect;
            }
            // Handle WxH explicit sizes, e.g., 1280x720
            const whMatch = token.match(/^(\d{2,4})x(\d{2,4})$/);
            if (whMatch) {
                const w = parseInt(whMatch[1], 10);
                const h = parseInt(whMatch[2], 10);
                if (w > 0 && h > 0) {
                    return screenWidth * (h / w);
                }
            }
            return null;
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        if (gameIdStr) {
            fetchGameData();
            checkWishlistStatus();
            checkPlayedStatus();
            checkExistingRating();
        }
    }, [gameIdStr, currentUserId]);

    // Hent spil-data — brug session-cache ved tilgængelighed for at undgå gentagne DB-opslag
    const fetchGameData = async () => {
        try {
            // Tjek session-cachen først
            const cached = sessionCache.get(gameIdStr);
            if (cached) {
                const src = cached.__cachedFromSource || 'unknown';
                console.log(`[RateGame] cache hit for ${gameIdStr} (source: ${src})`);
                setGameData(cached);
                setLoading(false);
                return;
            }

            // Cache miss -> hent fra database
            console.log(`[RateGame] cache miss for ${gameIdStr} — fetching from DB`);
            const gameRef = ref(db, `games/${gameIdStr}`);
            const gameSnapshot = await get(gameRef);

            if (!gameSnapshot.exists()) {
                Alert.alert('Error', 'Game not found');
                setLoading(false);
                return;
            }

            const gameData = gameSnapshot.val();
            console.log('[FETCHED] Game id:', gameData?.id || gameIdStr);
            setGameData(gameData);
            // Gem i session-cache for efterfølgende klik i samme session
            // (DB-fetched entries keep whatever source flag they may have)
            sessionCache.set(gameIdStr, gameData);
        } catch (error) {
            console.error('Error fetching game data:', error);
            Alert.alert('Error', 'Failed to load game data');
        } finally {
            setLoading(false);
        }
    };

    // Tjek wishlist-status — genbrug session-cache for at undgå ekstra spil-opslag ved cache-hit
    const checkWishlistStatus = async () => {
        try {
            if (!currentUserId) {
                setIsOnWishlist(false);
                setWishlistKey(null);
                return;
            }
            // Per-user path
            const wishlistRef = ref(db, `users/${currentUserId}/wishlist`);
            const wishlistSnapshot = await get(wishlistRef);

            if (wishlistSnapshot.exists()) {
                const wishlistData = wishlistSnapshot.val();
                // Forsøg at få internal ID fra cache først for at undgå ekstra DB-opslag
                const cached = sessionCache.get(gameIdStr);
                let gameInternalId = gameIdStr;
                if (cached && cached.id) {
                    gameInternalId = cached.id;
                } else {
                    // Fald tilbage til at hente spil-data fra DB (sjældent, kun på cache-miss)
                    const gameRef = ref(db, `games/${gameIdStr}`);
                    const gameSnapshot = await get(gameRef);
                    gameInternalId = gameSnapshot.exists() ? gameSnapshot.val().id : gameIdStr;
                    if (gameSnapshot.exists()) sessionCache.set(gameIdStr, gameSnapshot.val());
                }

                const existingEntry = Object.entries(wishlistData).find(
                    ([key, wishlistItem]) => wishlistItem.game_id === gameInternalId
                );

                if (existingEntry) {
                    setIsOnWishlist(true);
                    setWishlistKey(existingEntry[0]);
                } else {
                    setIsOnWishlist(false);
                    setWishlistKey(null);
                }
            } else {
                setIsOnWishlist(false);
                setWishlistKey(null);
            }
        } catch (error) {
            console.error('Error checking wishlist status:', error);
            setIsOnWishlist(false);
            setWishlistKey(null);
        }
    };

    // Tjek om brugeren allerede har givet en rating — genbrug cache for internal ID hvis muligt
    const checkExistingRating = async () => {
        try {
            if (!currentUserId) {
                setExistingRating(null);
                return;
            }
            const ratingsRef = ref(db, 'userRatings');
            const ratingsQuery = query(ratingsRef, orderByChild('user_id'), equalTo(currentUserId));
            const ratingsSnapshot = await get(ratingsQuery);

            if (ratingsSnapshot.exists()) {
                const ratingsData = ratingsSnapshot.val();
                // Forsøg at få internal ID fra cache først
                const cached = sessionCache.get(gameIdStr);
                let gameInternalId = getNormalizedGameIdForRatings(cached || gameData, gameIdStr);

                const existingEntry = Object.entries(ratingsData).find(
                    ([key, ratingItem]) => ratingItem.game_id === gameInternalId
                );

                if (existingEntry) {
                    const [ratingKey, ratingData] = existingEntry;
                    setExistingRating({
                        key: ratingKey,
                        rating: ratingData.rating,
                        comment: ratingData.comment || ''
                    });
                } else {
                    setExistingRating(null);
                }
            } else {
                setExistingRating(null);
            }
        } catch (error) {
            console.error('Error checking existing rating:', error);
            setExistingRating(null);
        }
    };

    // Tjek played-status
    const checkPlayedStatus = async () => {
        try {
            if (!currentUserId) {
                setIsPlayed(false);
                setPlayedKey(null);
                return;
            }
            const playedRef = ref(db, `users/${currentUserId}/played`);
            const playedSnapshot = await get(playedRef);

            if (playedSnapshot.exists()) {
                const playedData = playedSnapshot.val();
                // Forsøg at få internal ID fra cache først
                const cached = sessionCache.get(gameIdStr);
                let gameInternalId = gameIdStr;
                if (cached && cached.id) {
                    gameInternalId = cached.id;
                } else {
                    const gameRef = ref(db, `games/${gameIdStr}`);
                    const gameSnapshot = await get(gameRef);
                    gameInternalId = gameSnapshot.exists() ? gameSnapshot.val().id : gameIdStr;
                    if (gameSnapshot.exists()) sessionCache.set(gameIdStr, gameSnapshot.val());
                }

                const existingEntry = Object.entries(playedData).find(
                    ([key, playedItem]) => playedItem.game_id === gameInternalId
                );

                if (existingEntry) {
                    setIsPlayed(true);
                    setPlayedKey(existingEntry[0]);
                } else {
                    setIsPlayed(false);
                    setPlayedKey(null);
                }
            } else {
                setIsPlayed(false);
                setPlayedKey(null);
            }
        } catch (error) {
            console.error('Error checking played status:', error);
            setIsPlayed(false);
            setPlayedKey(null);
        }
    };

    const handleSubmitRating = async (rating, comment) => {
        try {
            if (!currentUserId) {
                Alert.alert('Login required', 'You need to be logged in to rate games.');
                return;
            }
            const ratingsRef = ref(db, 'userRatings');
            const gameInternalId = getNormalizedGameIdForRatings(gameData, gameIdStr);

            // Tjek for eksisterende rating
            const existingSnapshot = await get(ratingsRef);
            let existingRatingKey = null;

            if (existingSnapshot.exists()) {
                const ratings = existingSnapshot.val();
                const existingEntry = Object.entries(ratings).find(
                    ([key, ratingObj]) => ratingObj.game_id === gameInternalId && ratingObj.user_id === currentUserId
                );
                if (existingEntry) {
                    existingRatingKey = existingEntry[0];
                }
            }

            const roundedRating = formatRating(rating); // Round to nearest 0.5

            const ratingData = {
                game_id: gameInternalId,
                user_id: currentUserId,
                rating: roundedRating,
                comment: comment || null,
                timestamp: new Date().toISOString(),
            };

            let createdNew = false;
            if (existingRatingKey) {
                await set(ref(db, `userRatings/${existingRatingKey}`), ratingData);
                console.log('✅ Updated rating:', rating);
            } else {
                await set(push(ratingsRef), ratingData);
                createdNew = true;
                console.log('✅ Created rating:', roundedRating);
            }

            // Foreground-only follower notifications: only notify on first rating of a game by this user
            if (createdNew) {
                try {
                    // Fetch followers list once
                    const followersSnap = await get(ref(db, `followers/${currentUserId}`));
                    if (followersSnap.exists()) {
                        const followersObj = followersSnap.val() || {};
                        const followerIds = Object.keys(followersObj).filter(Boolean);
                        if (followerIds.length > 0) {
                            const userProfileSnap = await get(ref(db, `users/${currentUserId}`));
                            const userProfileVal = userProfileSnap.exists() ? userProfileSnap.val() : null;
                            const raterName = userProfileVal?.username || userProfileVal?.displayName || 'Someone';
                            const gameName = gameData?.name || 'a game';
                            const now = Date.now();
                            // Write a simple notification entry per follower under notifications/<followerUid>/rating_<ts>_<gameId>
                            await Promise.all(
                                followerIds.map(async (fid) => {
                                    const notifKey = `rating_${now}_${gameInternalId}_${currentUserId}`;
                                    await set(ref(db, `notifications/${fid}/${notifKey}`), {
                                        type: 'rating',
                                        fromUid: currentUserId,
                                        gameId: gameInternalId,
                                        gameKey: gameIdStr,
                                        gameName,
                                        rating: roundedRating,
                                        title: 'New rating',
                                        body: `${raterName} rated ${gameName} ${roundedRating}/10`,
                                        createdAt: now,
                                        delivered: false,
                                    });
                                })
                            );
                        }
                    }
                } catch (e) {
                    console.log('Rating notification write failed:', e.message);
                }
            }

            Alert.alert('Success', `Rating saved: ${roundedRating}/10`);
            // Opdater eksisterende rating state
            checkExistingRating();
        } catch (error) {
            console.error('Error saving rating:', error);
            Alert.alert('Error', 'Failed to save rating');
        }
    };

    const handleToggleWishlist = async () => {
        try {
            if (!currentUserId) {
                Alert.alert('Login required', 'You need to be logged in to manage your wishlist.');
                return;
            }
            const wishlistRef = ref(db, `users/${currentUserId}/wishlist`);
            const gameInternalId = getGameInternalId(gameData, gameIdStr);

            if (isOnWishlist && wishlistKey) {
                // Fjern fra wishlist
                const wishlistItemRef = ref(db, `users/${currentUserId}/wishlist/${wishlistKey}`);
                await set(wishlistItemRef, null);

                setIsOnWishlist(false);
                setWishlistKey(null);
                Alert.alert('Success', `${gameData.name} removed from your wishlist!`);
                console.log('✅ Removed from wishlist:', gameData.name);
            } else {
                // Tilføj til wishlist
                const wishlistData = {
                    game_id: gameInternalId,
                    user_id: currentUserId,
                    game_name: gameData.name,
                    added_timestamp: new Date().toISOString(),
                };

                const newWishlistRef = push(wishlistRef);
                await set(newWishlistRef, wishlistData);

                setIsOnWishlist(true);
                setWishlistKey(newWishlistRef.key);
                Alert.alert('Success', `${gameData.name} added to your wishlist!`);
                console.log('✅ Added to wishlist:', gameData.name);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            Alert.alert('Error', 'Failed to update wishlist');
        }
    };

    const handleTogglePlayed = async () => {
        try {
            if (!currentUserId) {
                Alert.alert('Login required', 'You need to be logged in to manage your played list.');
                return;
            }
            const playedRef = ref(db, `users/${currentUserId}/played`);
            const gameInternalId = getGameInternalId(gameData, gameIdStr);

            if (isPlayed && playedKey) {
                // Fjern fra played
                const playedItemRef = ref(db, `users/${currentUserId}/played/${playedKey}`);
                await set(playedItemRef, null);

                setIsPlayed(false);
                setPlayedKey(null);
                Alert.alert('Success', `${gameData.name} removed from your Played list!`);
                console.log('✅ Removed from played:', gameData.name);
            } else {
                // Tilføj til played
                const playedData = {
                    game_id: gameInternalId,
                    user_id: currentUserId,
                    game_name: gameData.name,
                    added_timestamp: new Date().toISOString(),
                };

                const newPlayedRef = push(playedRef);
                await set(newPlayedRef, playedData);

                setIsPlayed(true);
                setPlayedKey(newPlayedRef.key);
                Alert.alert('Success', `${gameData.name} added to your Played list!`);
                console.log('✅ Added to played:', gameData.name);
            }
        } catch (error) {
            console.error('Error toggling played:', error);
            Alert.alert('Error', 'Failed to update Played list');
        }
    };

    const artworkUrls = Array.isArray(gameData?.artworkUrls) && (gameData?.artworkUrls?.length > 0)
        ? gameData.artworkUrls
        : (gameData?.coverUrl ? [gameData.coverUrl] : []);
    const firstArtworkUri = artworkUrls[0];

    // Calculate measured ratios once artwork urls are known
    useEffect(() => {
        if (!firstArtworkUri) return;
        [firstArtworkUri].forEach((uri) => {
            if (!uri || artworkRatios[uri]) return;
            Image.getSize(uri,
                (w, h) => {
                    if (w > 0 && h > 0) {
                        setArtworkRatios((prev) => ({ ...prev, [uri]: h / w }));
                    }
                },
                (err) => {
                    // Ignore; fallback logic will handle
                    console.log('[IMAGE] getSize failed for', uri, err?.message || err);
                }
            );
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstArtworkUri]);

    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const getHeightForArtwork = (uri) => {
        const measuredRatio = uri ? artworkRatios[uri] : null;
        const fallbackRatio = (() => {
            const h = getHeaderHeightFromArtwork(uri);
            return h ? h / screenWidth : null; // convert height back to ratio if available
        })();
        const ratio = measuredRatio || fallbackRatio || 9 / 16; // default 16:9
        // If the image is an ultra-wide banner (<0.2), use a lower min height
        const minRatio = ratio < 0.2 ? 0.22 : 0.45;
        const clampedRatio = clamp(ratio, minRatio, 0.75);
        const h = screenWidth * clampedRatio;
        return h;
    };

    const headerHeight = getHeightForArtwork(firstArtworkUri) || rateGameStyles.headerContainer.height;
    useEffect(() => {
        const uri = firstArtworkUri;
        if (!uri) return;
        const measured = artworkRatios[uri];
        const height = getHeightForArtwork(uri);
        if (measured) {
            console.log('[ARTWORK] single image', { uri, measuredRatio: measured, chosenHeight: height, screenWidth });
        }
    }, [firstArtworkUri, artworkRatios, screenWidth]);

    const handleArtworkMomentumEnd = () => { };

    if (loading) return createLoadingView();
    if (!gameData) return createLoadingView("Game not found");

    return (
        <SafeAreaView style={rateGameStyles.container}>
            <ScrollView style={rateGameStyles.container}>
                {/* Header Image */}
                <View style={[rateGameStyles.headerContainer, { height: headerHeight }]}>
                    {(() => {
                        const uri = firstArtworkUri;
                        const ratio = artworkRatios[uri];
                        const isBanner = typeof ratio === 'number' && ratio < 0.2;
                        return (
                            <View style={{ width: screenWidth, height: '100%' }}>
                                <Image
                                    source={{ uri }}
                                    style={rateGameStyles.headerBackdrop}
                                    resizeMode="cover"
                                    blurRadius={isBanner ? 20 : 0}
                                />
                                <Image
                                    source={{ uri }}
                                    style={rateGameStyles.headerImage}
                                    resizeMode={isBanner ? 'contain' : 'cover'}
                                />
                                <LinearGradient
                                    colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.65)"]}
                                    style={rateGameStyles.headerGradient}
                                />
                            </View>
                        );
                    })()}
                </View>

                {/* Content */}
                <View style={rateGameStyles.contentContainer}>
                    <View style={rateGameStyles.gameInfoContainer}>
                        <Text style={rateGameStyles.gameTitle}>{gameData.name}</Text>
                        <Text style={rateGameStyles.gameYear}>
                            {formatDate(gameData.first_release_date)}
                        </Text>
                        {getPrimaryCompany(gameData) && (
                            <>
                                <Text style={rateGameStyles.madeByLabel}>Made by:</Text>
                                <Text style={rateGameStyles.gameCompany}>
                                    {getPrimaryCompany(gameData)}
                                </Text>
                            </>
                        )}
                    </View>

                    <Image
                        source={{ uri: gameData.coverUrl }}
                        style={rateGameStyles.gameCover}
                        resizeMode="cover"
                    />
                </View>

                {/* Summary (collapsed) under image, full width */}
                {!isSummaryExpanded && (
                    <TouchableOpacity
                        onPress={() => setIsSummaryExpanded(true)}
                        activeOpacity={0.9}
                        accessibilityRole="button"
                        accessibilityLabel="Expand game description"
                        style={rateGameStyles.collapsedSummaryContainer}
                    >
                        <Text
                            style={rateGameStyles.summaryFull}
                            numberOfLines={4}
                            ellipsizeMode="tail"
                        >
                            {gameData.summary || 'No summary available.'}
                        </Text>
                        <View pointerEvents="none" style={rateGameStyles.summaryFade} />
                    </TouchableOpacity>
                )}

            {!isSummaryExpanded && (
                <TouchableOpacity
                    onPress={() => setIsSummaryExpanded(true)}
                    activeOpacity={0.8}
                    style={rateGameStyles.summaryToggleButton}
                    accessibilityRole="button"
                    accessibilityLabel="Show more description"
                >
                    <Text style={rateGameStyles.summaryToggleText}>Show more</Text>
                </TouchableOpacity>
            )}

                {/* Summary full-width (expanded) — fylder resten af skærmen under billedet */}
                {isSummaryExpanded && (
                    <TouchableOpacity
                        onPress={() => setIsSummaryExpanded(false)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="Collapse game description"
                        style={rateGameStyles.fullSummaryContainer}
                    >
                        <Text style={rateGameStyles.summaryFull}>
                            {gameData.summary || 'No summary available.'}
                        </Text>
                    </TouchableOpacity>
                )}

            {isSummaryExpanded && (
                <TouchableOpacity
                    onPress={() => setIsSummaryExpanded(false)}
                    activeOpacity={0.8}
                    style={rateGameStyles.summaryToggleButton}
                    accessibilityRole="button"
                    accessibilityLabel="Show less description"
                >
                    <Text style={rateGameStyles.summaryToggleText}>Show less</Text>
                </TouchableOpacity>
            )}

                {/* Action Buttons */}
                <View style={rateGameStyles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={rateGameStyles.rateButton}
                        onPress={() => setRatingModalVisible(true)}
                    >
                        <Icon name="star" size={20} color="#FFD700" />
                        <Text
                            style={rateGameStyles.rateButtonText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.85}
                        >
                            {existingRating ? 'Update Rating' : 'Rate Game'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            rateGameStyles.wishlistButton,
                            isOnWishlist && rateGameStyles.wishlistButtonActive
                        ]}
                        onPress={handleToggleWishlist}
                    >
                        <Icon
                            name={isOnWishlist ? "bookmark" : "bookmark-outline"}
                            size={20}
                            color={isOnWishlist ? "#FF6B6B" : "#4CAF50"}
                        />
                        <Text style={[
                            rateGameStyles.wishlistButtonText,
                            isOnWishlist && rateGameStyles.wishlistButtonTextActive
                        ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.8}
                        >
                            {isOnWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            rateGameStyles.playedButton,
                            isPlayed && rateGameStyles.playedButtonActive
                        ]}
                        onPress={handleTogglePlayed}
                    >
                        <Icon
                            name={isPlayed ? "checkmark-circle" : "checkmark-circle-outline"}
                            size={20}
                            color={isPlayed ? "#00BCD4" : "#03A9F4"}
                        />
                        <Text style={[
                            rateGameStyles.playedButtonText,
                            isPlayed && rateGameStyles.playedButtonTextActive
                        ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.8}
                        >
                            {isPlayed ? "Unmark Played" : "Mark as Played"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Community Ratings */}
                <GameRatingsThread
                    gameInternalId={getNormalizedGameIdForRatings(gameData, gameIdStr)}
                    currentUserId={currentUserId}
                    includeSelf={true}
                />

                {/* Rating Modal */}
                <RatingModal
                    visible={ratingModalVisible}
                    onClose={() => setRatingModalVisible(false)}
                    gameData={gameData}
                    onSubmitRating={handleSubmitRating}
                    existingRating={existingRating}
                />
            </ScrollView>
        </SafeAreaView>
    );
};


export default RateGameList;