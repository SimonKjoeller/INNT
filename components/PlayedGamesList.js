import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { getDatabase, ref, get, query, orderByChild, equalTo } from 'firebase/database';
import Icon from 'react-native-vector-icons/Ionicons';
import { firebaseApp } from '../database/firebase';
import { libraryStyles } from '../styles/libraryStyles';
import GameListItem from './GameListItem';
import { useAuth } from './Auth';
import { useFocusEffect } from '@react-navigation/native';

const PlayedGamesList = ({ navigation, userId, sortMode = 'added_desc' }) => {
    const [playedGames, setPlayedGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const effectiveUserId = useMemo(() => userId || user?.uid || null, [userId, user]);

    useEffect(() => {
        fetchPlayed();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveUserId]);

    useEffect(() => {
        setPlayedGames(prev => {
            const copy = [...prev];
            copy.sort((a, b) => {
                const diff = new Date(a.added_timestamp) - new Date(b.added_timestamp);
                return sortMode === 'added_asc' ? diff : -diff;
            });
            return copy;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortMode]);

    // Refetch when Library screen gains focus
    useFocusEffect(
        useCallback(() => {
            fetchPlayed();
        }, [effectiveUserId])
    );

    const fetchPlayed = async () => {
        try {
            setLoading(true);
            const database = getDatabase(firebaseApp);
            if (!effectiveUserId) {
                setPlayedGames([]);
                return;
            }

            // Hent played-liste for brugeren (per-user path)
            const playedRef = ref(database, `users/${effectiveUserId}/played`);
            const playedSnapshot = await get(playedRef);

            if (playedSnapshot.exists()) {
                const playedData = playedSnapshot.val();
                const playedArray = Object.keys(playedData).map(key => ({
                    ...playedData[key],
                    playedKey: key
                }));

                // Hent kun de spil som findes i played (undgår at hente hele 'games' tabellen)
                const gamesRef = ref(database, 'games');
                const uniqueIds = [...new Set(playedArray.map(p => p.game_id))];

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

                // Her matches 
                // Merge spil-data først, så played-itemets egne felter (fx. tilføjelses-timestamp) bevares
                const enrichedPlayed = playedArray.map(playedItem => {
                    const match = gamesById[playedItem.game_id];
                    if (!match) {
                        console.warn(`Game not found for ID: ${playedItem.game_id}`);
                        return null;
                    }
                    const { firebaseKey, data: gameData } = match;
                    return {
                        ...gameData,        // spillets data først
                        ...playedItem,      // played-item overskriver ved konflikt
                        firebaseKey,        // Firebase key for navigation
                        gameId: playedItem.game_id,
                    };
                }).filter(item => item !== null);

                // Sorter efter added_timestamp
                enrichedPlayed.sort((a, b) => {
                    const diff = new Date(a.added_timestamp) - new Date(b.added_timestamp);
                    return sortMode === 'added_asc' ? diff : -diff;
                });

                setPlayedGames(enrichedPlayed);
            } else {
                setPlayedGames([]);
            }
        } catch (error) {
            console.error('Error fetching played list:', error);
            setPlayedGames([]);
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
                name="checkmark-done-outline"
                size={64}
                color="#444444"
                style={libraryStyles.emptyIcon}
            />
            <Text style={libraryStyles.emptyTitle}>
                Ingen spil i din Played-liste
            </Text>
            <Text style={libraryStyles.emptySubtitle}>
                Spil du markerer som spillet vil vises her.{'\n'}
                Find spil på forsiden eller søg efter dem!
            </Text>
        </View>
    );

    const renderGameItem = ({ item }) => (
        <GameListItem
            game={item}
            type="played"
            onPress={handleGamePress}
            showAddedDate={true}
        />
    );

    if (loading) {
        return (
            <View style={libraryStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text style={libraryStyles.loadingText}>
                    Indlæser Played-liste...
                </Text>
            </View>
        );
    }

    return (
        <View style={libraryStyles.contentContainer}>
            {playedGames.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={playedGames}
                    renderItem={renderGameItem}
                    keyExtractor={(item) => item.playedKey}
                    contentContainerStyle={libraryStyles.gamesList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default PlayedGamesList;


