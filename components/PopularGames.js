import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { firebaseApp } from '../database/firebase';

const { width } = Dimensions.get('window');

const PopularGames = ({ navigation }) => {
    const [popularGames, setPopularGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPopularGames();
    }, []);

    const fetchPopularGames = async () => {
        try {
            const database = getDatabase(firebaseApp);
            const gamesRef = ref(database, 'games');
            const snapshot = await get(gamesRef);

            if (snapshot.exists()) {
                const gamesData = snapshot.val();
                // Konverter til array og sorter efter reviewCount (højeste først)
                const gamesArray = Object.keys(gamesData)
                    .map(key => ({
                        id: key,
                        ...gamesData[key]
                    }))
                    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
                    .slice(0, 10); // Tag de første 10 mest populære

                setPopularGames(gamesArray);
            }
        } catch (error) {
            console.error('Error fetching popular games:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGamePress = (gameId) => {
        navigation.navigate('RateGame', { gameId });
    };

    if (loading) {
        return (
            <View style={popularGamesStyles.container}>
                <Text style={popularGamesStyles.title}>Popular Games</Text>
                <Text style={popularGamesStyles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={popularGamesStyles.container}>
            <Text style={popularGamesStyles.title}>Popular Games</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={popularGamesStyles.scrollContainer}
            >
                {popularGames.map((game, index) => (
                    <TouchableOpacity
                        key={game.id}
                        style={[
                            popularGamesStyles.gameCard,
                            { marginLeft: index === 0 ? 20 : 10 },
                            { marginRight: index === popularGames.length - 1 ? 20 : 0 }
                        ]}
                        onPress={() => handleGamePress(game.id)}
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
                            <Text style={popularGamesStyles.reviewCount}>
                                {game.reviewCount || 0} reviews
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const popularGamesStyles = {
    container: {
        marginVertical: 20,
    },
    title: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 20,
        marginBottom: 15,
    },
    loadingText: {
        color: '#aaa',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    scrollContainer: {
        paddingVertical: 5,
    },
    gameCard: {
        width: width * 0.3, // 30% af skærm bredde
        marginRight: 10,
    },
    gameImage: {
        width: '100%',
        height: width * 0.45, // 1.5:1 ratio for covers
        borderRadius: 8,
    },
    gameInfo: {
        marginTop: 8,
        paddingHorizontal: 2,
    },
    gameName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        lineHeight: 18,
    },
    reviewCount: {
        color: '#aaa',
        fontSize: 12,
    },
};

export default PopularGames;