import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ref, get, query, orderByChild, startAt, limitToLast } from 'firebase/database';
import { db } from '../database/firebase';
import { popularGamesStyles } from '../styles/homeStyles';
import sessionCache from '../caching/sessionCache';
import listCache from '../caching/listCache';

const UpcomingGames = ({ navigation }) => {
    const [upcomingGames, setUpcomingGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUpcomingGames();
    }, []);

    const fetchUpcomingGames = async () => {
        try {
            const gamesRef = ref(db, 'games');
            const nowSeconds = Math.floor(Date.now() / 1000);

            // Query upcoming games and pick the furthest-future 10 entries (unreleased)
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

                // Normalize & sort by first_release_date (descending) so the
                // furthest-future/unreleased games appear first regardless of
                // how dates are stored (seconds, milliseconds, or year).
                const normalizeDate = (val) => {
                    const n = Number(val);
                    if (!isFinite(n)) return 0;
                    if (n > 1e12) return Math.floor(n / 1000);
                    if (n > 1e9) return n;
                    if (n >= 1900 && n <= 3000) return Math.floor(new Date(n, 0, 1).getTime() / 1000);
                    return n;
                };

                gamesArray.sort((a, b) => {
                    const ra = normalizeDate(a.first_release_date);
                    const rb = normalizeDate(b.first_release_date);
                    return rb - ra; // descending
                });

                // Cache preview items
                try {
                    for (const entry of gamesArray) {
                        const key = entry.firebaseKey;
                        const already = sessionCache.get(key);
                        if (!already) {
                            const cachedEntry = { ...entry, __cachedFromSource: 'upcoming' };
                            sessionCache.set(key, cachedEntry);
                            listCache.add(key);
                        }
                    }
                } catch (e) {
                    console.log('[UpcomingGamesHome] cache loop error', e?.message || e);
                }

                setUpcomingGames(gamesArray);
            } else {
                setUpcomingGames([]);
            }
        } catch (error) {
            console.error('[UpcomingGamesHome] fetch error', error);
            setUpcomingGames([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGamePress = (game) => {
        navigation.navigate('RateGame', { gameId: game.firebaseKey });
    };

    if (loading) {
        return (
            <View style={popularGamesStyles.container}>
                <Text style={popularGamesStyles.title}>Upcoming Games</Text>
                <Text style={popularGamesStyles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={popularGamesStyles.container}>
            <TouchableOpacity
                style={popularGamesStyles.titleContainer}
                onPress={() => navigation.navigate('Upcoming')}
            >
                <Text style={popularGamesStyles.title}>Upcoming Games</Text>
                <Text style={popularGamesStyles.arrow}>›</Text>
            </TouchableOpacity>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={popularGamesStyles.scrollContainer}
            >
                {upcomingGames.map((game, index) => (
                    <TouchableOpacity
                        key={game.id}
                        style={[
                            popularGamesStyles.gameCard,
                            { marginLeft: index === 0 ? 20 : 10 },
                            { marginRight: index === upcomingGames.length - 1 ? 20 : 0 },
                        ]}
                        onPress={() => handleGamePress(game)}
                    >
                        <Image source={{ uri: game.coverUrl }} style={popularGamesStyles.gameImage} resizeMode="cover" />
                        <View style={popularGamesStyles.gameInfo}>
                            <Text style={popularGamesStyles.gameName} numberOfLines={2}>
                                {game.name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default UpcomingGames;