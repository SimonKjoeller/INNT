import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../database/firebase';
import styles from '../styles/trendingScreenStyles';
import globalStyles from '../styles/globalStyles';
import sessionCache from '../caching/sessionCache';
import listCache from '../caching/listCache';

const FullTrendingGames = ({ navigation }) => {
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
                snapshot.forEach((childSnapshot) => {
                    const gameData = childSnapshot.val();
                    const entry = {
                        firebaseKey: childSnapshot.key,
                        id: gameData?.id || childSnapshot.key,
                        ...gameData
                    };
                    gamesArray.push(entry);
                });
                gamesArray.reverse();
                // Select 32 newest by release date
                const newest32 = gamesArray
                    .filter(game => game.first_release_date)
                    .sort((a, b) => new Date(b.first_release_date) - new Date(a.first_release_date))
                    .slice(0, 32);
                // Cache only the 32 items we actually show
                try {
                    for (const entry of newest32) {
                        const key = entry.firebaseKey;
                        const already = sessionCache.get(key);
                        if (!already) {
                            const cachedEntry = { ...entry, __cachedFromSource: 'trending' };
                            sessionCache.set(key, cachedEntry);
                            console.log(`[FullTrendingGames] cached game ${key}`);
                            const evicted = listCache.add(key);
                            if (evicted) console.log(`[FullTrendingGames] listCache evicted: ${evicted}`);
                        }
                    }
                } catch (e) {
                    console.log('[FullTrendingGames] cache loop error', e?.message || e);
                }
                setTrendingGames(newest32);
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
            <View style={globalStyles.container}>
                <Text style={styles.headerTitle}>Trending Games</Text>
                <Text style={styles.headerSubtitle}>Loading...</Text>
            </View>
        );
    }

    // Normalize image field for compatibility
    const normalizedGames = trendingGames.map(g => {
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

export default FullTrendingGames;
