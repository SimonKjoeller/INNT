import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { firebaseApp } from '../database/firebase';
import { popularGamesStyles } from '../styles/homeStyles';

const TrendingGames = ({ navigation }) => {
    const [trendingGames, setTrendingGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrendingGames();
    }, []);

    const fetchTrendingGames = async () => {
        try {
            const database = getDatabase(firebaseApp);
            const gamesRef = ref(database, 'games');
            const snapshot = await get(gamesRef);

            if (snapshot.exists()) {
                const gamesData = snapshot.val();
                //top 100 by reviewCount
                const top100 = Object.keys(gamesData)
                    .map(key => {
                        const gameData = gamesData[key];
                        return {
                            firebaseKey: key,
                            id: gameData?.id || key,
                            ...gameData
                        };
                    })
                    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
                    .slice(0, 100);
                // tager de 10 nyeste blandt de 100 mest anmeldte spil
                const newest10 = top100
                    .filter(game => game.first_release_date)
                    .sort((a, b) => new Date(b.first_release_date) - new Date(a.first_release_date))
                    .slice(0, 10);
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
            <Text style={popularGamesStyles.title}>Trending Games</Text>
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
