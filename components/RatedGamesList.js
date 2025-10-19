import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { getDatabase, ref, get, query, orderByChild, equalTo } from 'firebase/database';
import Icon from 'react-native-vector-icons/Ionicons';
import { firebaseApp } from '../database/firebase';
import { libraryStyles } from '../styles/libraryStyles';
import GameListItem from './GameListItem';

const RatedGamesList = ({ navigation, userId = "user1" }) => { // Default user for now
    const [ratedGames, setRatedGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRatedGames();
    }, [userId]);

    const fetchRatedGames = async () => {
        try {
            setLoading(true);
            const database = getDatabase(firebaseApp);

            // Hent ratings for brugeren
            const ratingsRef = ref(database, 'userRatings');
            console.log('ratingsRef', ratingsRef);
            const ratingsQuery = query(ratingsRef, orderByChild('user_id'), equalTo(userId));
            const ratingsSnapshot = await get(ratingsQuery);

            if (ratingsSnapshot.exists()) {
                const ratingsData = ratingsSnapshot.val();
                const ratingsArray = Object.keys(ratingsData).map(key => ({
                    ...ratingsData[key],
                    ratingKey: key
                }));

                // Hent game detaljer for hvert rated spil
                const gamesRef = ref(database, 'games');
                const gamesSnapshot = await get(gamesRef);

                if (gamesSnapshot.exists()) {
                    const gamesData = gamesSnapshot.val();

                    // Match rating items med game data ved internal ID
                    const enrichedRatings = ratingsArray.map(ratingItem => {
                        // Find det rigtige spil ved at søge efter internal ID
                        const gameEntry = Object.entries(gamesData).find(
                            ([firebaseKey, gameData]) => gameData.id === ratingItem.game_id
                        );

                        if (!gameEntry) {
                            console.warn(`Game not found for ID: ${ratingItem.game_id}`);
                            return null;
                        }

                        const [firebaseKey, gameData] = gameEntry;

                        return {
                            ...ratingItem,
                            ...gameData,
                            firebaseKey: firebaseKey, // Correct Firebase key for navigation
                            gameId: ratingItem.game_id, // Internal game ID
                        };
                    }).filter(item => item !== null); // Filtrer null entries

                    // Sorter efter timestamp (nyeste først)
                    enrichedRatings.sort((a, b) =>
                        new Date(b.timestamp) - new Date(a.timestamp)
                    );

                    setRatedGames(enrichedRatings);
                }
            } else {
                setRatedGames([]);
            }
        } catch (error) {
            console.error('Error fetching rated games:', error);
            setRatedGames([]);
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
                name="star-outline"
                size={64}
                color="#444444"
                style={libraryStyles.emptyIcon}
            />
            <Text style={libraryStyles.emptyTitle}>
                Ingen bedømte spil
            </Text>
            <Text style={libraryStyles.emptySubtitle}>
                Spil du giver en bedømmelse vil vises her.{'\n'}
                Start med at rate nogle af dine yndlingsspil!
            </Text>
        </View>
    );

    const renderGameItem = ({ item }) => (
        <GameListItem
            game={item}
            type="rated"
            onPress={handleGamePress}
            showRating={true}
            showAddedDate={false}
        />
    );

    if (loading) {
        return (
            <View style={libraryStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text style={libraryStyles.loadingText}>
                    Indlæser bedømte spil...
                </Text>
            </View>
        );
    }

    return (
        <View style={libraryStyles.contentContainer}>
            {ratedGames.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={ratedGames}
                    renderItem={renderGameItem}
                    keyExtractor={(item) => item.ratingKey}
                    contentContainerStyle={libraryStyles.gamesList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default RatedGamesList;
