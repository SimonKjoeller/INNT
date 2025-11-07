import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../database/firebase';
import styles from '../styles/trendingScreenStyles';
import globalStyles from '../styles/globalStyles';
import sessionCache from '../caching/sessionCache';
import listCache from '../caching/listCache';

const FullPopularGames = ({ navigation }) => {
    const [popularGames, setPopularGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPopularGames();
    }, []);

    const fetchPopularGames = async () => {
        try {
            const gamesRef = ref(db, 'games');
            const topGamesQuery = query(
                gamesRef,
                orderByChild('reviewCount'),
                limitToLast(32)
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
                setPopularGames(gamesArray);
            }
        } catch (error) {
            console.error('Error fetching popular games:', error);
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
                <Text style={styles.headerTitle}>Popular Games</Text>
                <Text style={styles.headerSubtitle}>Loading...</Text>
            </View>
        );
    }

    // Normalize image field for compatibility
    const normalizedGames = popularGames.map(g => {
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

export default FullPopularGames;
