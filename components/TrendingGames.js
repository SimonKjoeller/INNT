import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import sessionCache from '../caching/sessionCache';
import listCache from '../caching/listCache';
import { db } from '../database/firebase';
import { popularGamesStyles } from '../styles/homeStyles';

const TrendingGames = ({ navigation }) => {
    const [trendingGames, setTrendingGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrendingGames();
    }, []);

    const fetchTrendingGames = async () => {
        try {
            const gamesRef = ref(db, 'games');

            const topGamesQuery = query(
                gamesRef,
                orderByChild('reviewCount'),
                limitToLast(100)
            );

            const snapshot = await get(topGamesQuery);

            if (snapshot.exists()) {
                const gamesArray = [];

                // Saml resultater (ingen caching her)
                snapshot.forEach((childSnapshot) => {
                    const gameData = childSnapshot.val();
                    const entry = {
                        firebaseKey: childSnapshot.key,
                        id: gameData?.id || childSnapshot.key,
                        ...gameData
                    };
                    gamesArray.push(entry);
                });

                // Mest populære først
                gamesArray.reverse();

                // Fra disse top 100: vælg de 10 nyeste baseret på first_release_date
                const newest10 = gamesArray
                    .filter(game => game.first_release_date)
                    .sort((a, b) => new Date(b.first_release_date) - new Date(a.first_release_date))
                    .slice(0, 10);

                // Cache kun de 10 items vi faktisk viser
                try {
                    for (const entry of newest10) {
                        const key = entry.firebaseKey;
                        const already = sessionCache.get(key);
                        if (!already) {
                            const cachedEntry = { ...entry, __cachedFromSource: 'trending' };
                            sessionCache.set(key, cachedEntry);
                            console.log(`[TrendingGames] cached game ${key}`);
                            const evicted = listCache.add(key);
                            if (evicted) console.log(`[TrendingGames] listCache evicted: ${evicted}`);
                        }
                    }
                } catch (e) {
                    console.log('[TrendingGames] cache loop error', e?.message || e);
                }

                setTrendingGames(newest10);
            }
        } catch (error) {
            console.error('Error fetching trending games:', error);
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
                <Text style={popularGamesStyles.title}>Trending Games</Text>
                <Text style={popularGamesStyles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={popularGamesStyles.container}>
            <TouchableOpacity 
                style={popularGamesStyles.titleContainer}
                onPress={() => navigation.navigate('Trending')}
            >
                <Text style={popularGamesStyles.title}>Trending Games</Text>
                <Text style={popularGamesStyles.arrow}>›</Text>
            </TouchableOpacity>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={popularGamesStyles.scrollContainer}
            >
                {trendingGames.map((game, index) => (
                    <TouchableOpacity
                        key={game.id}
                        style={[
                            popularGamesStyles.gameCard,
                            { marginLeft: index === 0 ? 20 : 10 },
                            { marginRight: index === trendingGames.length - 1 ? 20 : 0 }
                        ]}
                        onPress={() => handleGamePress(game)}
                    >
                        <Image
                            source={{ uri: game.coverUrl }}
                            style={popularGamesStyles.gameImage}
                            resizeMode="cover"
                        />
                        <View style={popularGamesStyles.gameInfo}>
                            <Text
                                style={popularGamesStyles.gameName}
                                numberOfLines={2}
                            >
                                {game.name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default TrendingGames;
