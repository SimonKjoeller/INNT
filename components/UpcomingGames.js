import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ref, get, query, orderByChild, startAt, limitToFirst } from 'firebase/database';
import { db } from '../database/firebase';
import GameListItem from './GameListItem';
import browseByStyles from '../styles/browseByStyles';
import sessionCache from '../caching/sessionCache';
import listCache from '../caching/listCache';

const UpcomingGames = (props) => {
    const navigation = props.navigation || useNavigation();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUpcomingGames();
    }, []);

    // Fetch upcoming games from Firebase ordered by first_release_date (soonest first)
    const fetchUpcomingGames = async () => {
        try {
            const gamesRef = ref(db, 'games');
            const nowSeconds = Math.floor(Date.now() / 1000);

            // Query: order by first_release_date and return the last 10 entries starting at now
            // Using limitToLast gives us the entries with the largest (furthest future) dates
            const upcomingQuery = query(
                gamesRef,
                orderByChild('first_release_date'),
                startAt(nowSeconds),
                limitToLast(10)
            );

            const snapshot = await get(upcomingQuery);
            if (snapshot.exists()) {
                const gamesArray = [];
                snapshot.forEach((childSnapshot) => {
                    const gameData = childSnapshot.val();
                    const entry = {
                        firebaseKey: childSnapshot.key,
                        id: gameData?.id || childSnapshot.key,
                        ...gameData,
                    };
                    gamesArray.push(entry);
                });

                // Normalize and sort by first_release_date (descending) so the
                // furthest-future/unreleased games appear first regardless of
                // how dates are stored (seconds, milliseconds, or year).
                const normalizeDate = (val) => {
                    const n = Number(val);
                    if (!isFinite(n)) return 0;
                    // milliseconds timestamp -> convert to seconds
                    if (n > 1e12) return Math.floor(n / 1000);
                    // seconds timestamp
                    if (n > 1e9) return n;
                    // year like 1952 -> approximate to Jan 1st of that year
                    if (n >= 1900 && n <= 3000) return Math.floor(new Date(n, 0, 1).getTime() / 1000);
                    return n;
                };

                gamesArray.sort((a, b) => {
                    const ra = normalizeDate(a.first_release_date);
                    const rb = normalizeDate(b.first_release_date);
                    return rb - ra; // descending
                });

                // Cache entries similarly to PopularGames
                try {
                    for (const entry of gamesArray) {
                        const key = entry.firebaseKey;
                        const already = sessionCache.get(key);
                        if (!already) {
                            const cachedEntry = { ...entry, __cachedFromSource: 'upcoming' };
                            sessionCache.set(key, cachedEntry);
                            const evicted = listCache.add(key);
                            // optional logging
                        }
                    }
                } catch (e) {
                    console.log('[UpcomingGames] cache loop error', e?.message || e);
                }

                setGames(gamesArray);
            } else {
                setGames([]);
            }
        } catch (error) {
            console.error('[UpcomingGames] fetch error', error);
            setGames([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGamePress = (game) => {
        navigation.navigate('RateGame', { gameId: game.id || game.firebaseKey });
    };

    if (loading) {
        return (
            <View style={browseByStyles.container}>
                <ActivityIndicator size="large" color="#888" />
            </View>
        );
    }

    if (!games.length) {
        return (
            <View style={browseByStyles.container}>
                <Text>No upcoming games found.</Text>

            </View>
        );
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={browseByStyles.gameCard}
            onPress={() => handleGamePress(item)}
            activeOpacity={0.8}
        >
            <GameListItem game={item} />
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={games}
            keyExtractor={(item) => (item.id ? item.id.toString() : String(item.firebaseKey))}
            numColumns={4}
            renderItem={renderItem}
            columnWrapperStyle={browseByStyles.gridRow}
            contentContainerStyle={browseByStyles.scrollContent}
            style={browseByStyles.scrollView}
        />
    );
};

export default UpcomingGames;
