import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '../database/firebase';
import { popularGamesStyles } from '../styles/homeStyles';
import sessionCache from '../caching/sessionCache';
import listCache from '../caching/listCache';

const UpcomingGames = ({ navigation }) => {
    const [upcomingGames, setUpcomingGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //fetchUpcomingGames();
    }, []);

    const fetchUpcomingGames = async () => {
        try {
            const gamesRef = ref(db, 'games');
            const snapshot = await get(gamesRef);
            if (snapshot.exists()) {
                const gamesArray = [];
                const today = new Date();
                snapshot.forEach((childSnapshot) => {
                    const gameData = childSnapshot.val();
                    let releaseDate = null;
                    if (gameData.first_release_date) {
                        releaseDate = new Date(gameData.first_release_date);
                        if (isNaN(releaseDate.getTime())) {
                            releaseDate = new Date(Number(gameData.first_release_date));
                        }
                    }
                    if (releaseDate && releaseDate > today) {
                        const entry = {
                            firebaseKey: childSnapshot.key,
                            id: gameData?.id || childSnapshot.key,
                            ...gameData
                        };
                        gamesArray.push(entry);
                    }
                });
                gamesArray.sort((a, b) => new Date(a.first_release_date) - new Date(b.first_release_date));
                const upcoming10 = gamesArray.slice(0, 10);
                try {
                    for (const entry of upcoming10) {
                        const key = entry.firebaseKey;
                        const already = sessionCache.get(key);
                        if (!already) {
                            const cachedEntry = { ...entry, __cachedFromSource: 'upcoming' };
                            sessionCache.set(key, cachedEntry);
                            const evicted = listCache.add(key);
                        }
                    }
                } catch (e) {
                    console.log('[UpcomingGames] cache loop error', e?.message || e);
                }
                setUpcomingGames(upcoming10);
            } else {
                setUpcomingGames([]);
            }
        } catch (error) {
            console.error('Error fetching upcoming games:', error);
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
                            { marginRight: index === upcomingGames.length - 1 ? 20 : 0 }
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

export default UpcomingGames;
