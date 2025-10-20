import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
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

                snapshot.forEach((childSnapshot) => {
                    const gameData = childSnapshot.val();
                    gamesArray.push({
                        firebaseKey: childSnapshot.key,
                        id: gameData?.id || childSnapshot.key,
                        ...gameData
                    });
                });

                gamesArray.reverse();


                const newest10 = gamesArray
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
