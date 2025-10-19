import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '../database/firebase';
import { popularGamesStyles } from '../styles/homeStyles';

const PopularGames = ({ navigation }) => {
    const [popularGames, setPopularGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPopularGames();
    }, []);

    const fetchPopularGames = async () => {
        try {
            const gamesRef = ref(db, 'games');
            const snapshot = await get(gamesRef);

            if (snapshot.exists()) {
                const gamesData = snapshot.val();
                // Konverter til array og sorter efter reviewCount (højeste først)
                const gamesArray = Object.keys(gamesData)
                    .map(key => {
                        const gameData = gamesData[key];
                        return {
                            firebaseKey: key, // Firebase key (72)
                            id: gameData?.id || key, // Use internal ID if exists, otherwise firebase key
                            ...gameData
                        };
                    })
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

    const handleGamePress = (game) => {
        navigation.navigate('RateGame', { gameId: game.firebaseKey });
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
        <ScrollView style={popularGamesStyles.homeContainer}>
            {/* Popular Games Section */}
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
        </ScrollView>
    );
};

export default PopularGames;