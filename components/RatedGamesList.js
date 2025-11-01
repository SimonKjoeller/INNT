import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../database/firebase';
import { libraryStyles } from '../styles/libraryStyles';
import GameListItem from './GameListItem';
import { useAuth } from './Auth';
import { useFocusEffect } from '@react-navigation/native';

const RatedGamesList = ({ navigation, userId }) => {
    const [ratedGames, setRatedGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const effectiveUserId = useMemo(() => userId || user?.uid || null, [userId, user]);

    useEffect(() => {
        fetchRatedGames();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveUserId]);

    // Refetch when Library screen gains focus
    useFocusEffect(
        useCallback(() => {
            fetchRatedGames();
        }, [effectiveUserId])
    );

    const fetchRatedGames = async () => {
        try {
            setLoading(true);
            if (!effectiveUserId) {
                setRatedGames([]);
                return;
            }

            // Hent ratings for brugeren
            const ratingsRef = ref(db, 'userRatings');
            const ratingsQuery = query(ratingsRef, orderByChild('user_id'), equalTo(effectiveUserId));
            const ratingsSnapshot = await get(ratingsQuery);

            if (ratingsSnapshot.exists()) {
                const ratingsData = ratingsSnapshot.val();
                const ratingsArray = Object.keys(ratingsData).map(key => ({
                    ...ratingsData[key],
                    ratingKey: key
                }));

                // Hent kun nødvendige spil for brugerens ratings (undgår at hente hele 'games' tabellen)
                const gamesRef = ref(db, 'games');
                const uniqueIds = [...new Set(ratingsArray.map(r => r.game_id))];

                // Lav parallelle forespørgsler for hver unik game_id
                const gameFetchPromises = uniqueIds.map(id =>
                    get(query(gamesRef, orderByChild('id'), equalTo(id)))
                );

                const gameSnapshots = await Promise.all(gameFetchPromises);

                // Byg en map fra internal id -> { firebaseKey, data }
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

                // Match rating items med fundne game-data
                // Merge game-data først, så brugerens rating/felter (ratingItem) overskriver ved behov
                const enrichedRatings = ratingsArray.map(ratingItem => {
                    const match = gamesById[ratingItem.game_id];
                    if (!match) {
                        console.warn(`Game not found for ID: ${ratingItem.game_id}`);
                        return null;
                    }
                    const { firebaseKey, data: gameData } = match;
                    return {
                        ...gameData,         // spillets data først
                        ...ratingItem,       // brugerens rating overskriver ved konflikt
                        firebaseKey,
                        gameId: ratingItem.game_id,
                    };
                }).filter(item => item !== null);

                // Sorter efter timestamp (nyeste først)
                enrichedRatings.sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );

                setRatedGames(enrichedRatings);
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
