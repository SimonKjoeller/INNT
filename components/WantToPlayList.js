import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { getDatabase, ref, get, query, orderByChild, equalTo } from 'firebase/database';
import Icon from 'react-native-vector-icons/Ionicons';
import { firebaseApp } from '../database/firebase';
import { libraryStyles } from '../styles/libraryStyles';
import GameListItem from './GameListItem';

const WantToPlayList = ({ navigation, userId = "user1" }) => { // Default user for now
    const [wishlistGames, setWishlistGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, [userId]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const database = getDatabase(firebaseApp);

            // Hent wishlist for brugeren
            const wishlistRef = ref(database, 'userWishlist');
            const wishlistQuery = query(wishlistRef, orderByChild('user_id'), equalTo(userId));
            const wishlistSnapshot = await get(wishlistQuery);

            if (wishlistSnapshot.exists()) {
                const wishlistData = wishlistSnapshot.val();
                const wishlistArray = Object.keys(wishlistData).map(key => ({
                    ...wishlistData[key],
                    wishlistKey: key
                }));

                // Hent game detaljer for hvert spil i wishlisten
                const gamesRef = ref(database, 'games');
                const gamesSnapshot = await get(gamesRef);

                if (gamesSnapshot.exists()) {
                    const gamesData = gamesSnapshot.val();

                    // Match wishlist items med game data ved internal ID
                    const enrichedWishlist = wishlistArray.map(wishlistItem => {
                        // Find det rigtige spil ved at søge efter internal ID
                        const gameEntry = Object.entries(gamesData).find(
                            ([firebaseKey, gameData]) => gameData.id === wishlistItem.game_id
                        );

                        if (!gameEntry) {
                            console.warn(`Game not found for ID: ${wishlistItem.game_id}`);
                            return null;
                        }

                        const [firebaseKey, gameData] = gameEntry;

                        return {
                            ...wishlistItem,
                            ...gameData,
                            firebaseKey: firebaseKey, // Correct Firebase key for navigation
                            gameId: wishlistItem.game_id, // Internal game ID
                        };
                    }).filter(item => item !== null); // Filtrer null entries

                    // Sorter efter added_timestamp (nyeste først)
                    enrichedWishlist.sort((a, b) =>
                        new Date(b.added_timestamp) - new Date(a.added_timestamp)
                    );

                    setWishlistGames(enrichedWishlist);
                }
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
