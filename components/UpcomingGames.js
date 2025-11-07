import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '../database/firebase';
import styles from '../styles/trendingScreenStyles';
import globalStyles from '../styles/globalStyles';
import sessionCache from '../caching/sessionCache';
import listCache from '../caching/listCache';

const UpcomingGames = ({ navigation }) => {
    const [upcomingGames, setUpcomingGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        (async () => {
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
                    const upcoming32 = gamesArray.slice(0, 32);
                    try {
                        for (const entry of upcoming32) {
                            const key = entry.firebaseKey;
                            const already = sessionCache.get(key);
                            if (!already) {
                                const cachedEntry = { ...entry, __cachedFromSource: 'upcoming' };
                                sessionCache.set(key, cachedEntry);
                                const evicted = listCache.add(key);
                            }
                        }
                    } catch (e) {
                        // cache error
                    }
                    if (isMounted) setUpcomingGames(upcoming32);
                } else {
                    if (isMounted) setUpcomingGames([]);
                }
            } catch (error) {
                if (isMounted) setUpcomingGames([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        })();
        return () => { isMounted = false; };
    }, []);

    const handleGamePress = (game) => {
        navigation.navigate('RateGame', { gameId: game.firebaseKey });
    };

    if (loading) {
        return (
            <View style={globalStyles.container}>
                <Text style={styles.headerTitle}>Upcoming Games</Text>
                <Text style={styles.headerSubtitle}>Loading...</Text>
            </View>
        );
    }

    if (!upcomingGames.length) {
        return (
            <View style={globalStyles.container}>
                <Text style={styles.headerTitle}>Upcoming Games</Text>
                <Text style={styles.headerSubtitle}>No upcoming games found.</Text>
            </View>
        );
    }

    // Normalize image field for compatibility
    const normalizedGames = upcomingGames.map(g => {
        const imageCandidate = g.coverUrl || g.image || null;
        return { ...g, image: imageCandidate };
    });

    // Group games into rows of 4
    const gameRows = [];
    for (let i = 0; i < normalizedGames.length; i += 4) {
        gameRows.push(normalizedGames.slice(i, i + 4));
    }

    const renderGameCard = (game) => {
        let imageSource = null;
        if (typeof game.image === 'number') {
            imageSource = game.image;
        } else if (typeof game.image === 'string' && game.image.length > 0) {
            imageSource = { uri: game.image };
        }
        return (
            <TouchableOpacity key={game.id} style={styles.gameCard} onPress={() => handleGamePress(game)}>
                {imageSource ? (
                    <Image source={imageSource} style={styles.gameImage} />
                ) : (
                    <View style={[styles.gameImage, { backgroundColor: '#cccccc' }]} />
                )}
                <View style={styles.gameInfo} />
            </TouchableOpacity>
        );
    };

    const renderRow = (games, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
            {games.map(game => renderGameCard(game))}
        </View>
    );

    return (
        <View style={[globalStyles.container, styles.customBackground]}>
            <ScrollView
                style={[globalStyles.scrollView, styles.scrollView]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[globalStyles.scrollContent, styles.scrollContent]}
            >
                {gameRows.map((row, index) => renderRow(row, index))}
            </ScrollView>
        </View>
    );
};

export default UpcomingGames;
