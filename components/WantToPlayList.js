import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { getDatabase, ref, get, query, orderByChild, equalTo } from 'firebase/database';
import Icon from 'react-native-vector-icons/Ionicons';
import { firebaseApp } from '../database/firebase';
import { libraryStyles } from '../styles/libraryStyles';
import GameListItem from './GameListItem';
import { useAuth } from './Auth';

const WantToPlayList = ({ navigation, userId }) => {
    const [wishlistGames, setWishlistGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const effectiveUserId = useMemo(() => userId || user?.uid || null, [userId, user]);

    useEffect(() => {
        fetchWishlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveUserId]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const database = getDatabase(firebaseApp);
            if (!effectiveUserId) {
                setWishlistGames([]);
                return;
            }

            // Hent wishlist for brugeren
            const wishlistRef = ref(database, 'userWishlist');
            const wishlistQuery = query(wishlistRef, orderByChild('user_id'), equalTo(effectiveUserId));
            const wishlistSnapshot = await get(wishlistQuery);

            if (wishlistSnapshot.exists()) {
                const wishlistData = wishlistSnapshot.val();
                const wishlistArray = Object.keys(wishlistData).map(key => ({
                    ...wishlistData[key],
                    wishlistKey: key
                }));

                // Hent kun de spil som findes i wishlisten (undgår at hente hele 'games' tabellen)
                const gamesRef = ref(database, 'games');
                const uniqueIds = [...new Set(wishlistArray.map(w => w.game_id))];

                // Parallelle forespørgsler pr. unik game_id
                const gameFetchPromises = uniqueIds.map(id =>
                    get(query(gamesRef, orderByChild('id'), equalTo(id)))
                );

                const gameSnapshots = await Promise.all(gameFetchPromises);

                // Byg map fra internal id -> { firebaseKey, data }
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

                // Sorter efter added_timestamp (nyeste først)
                enrichedWishlist.sort((a, b) =>
                    new Date(b.added_timestamp) - new Date(a.added_timestamp)
                );

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
