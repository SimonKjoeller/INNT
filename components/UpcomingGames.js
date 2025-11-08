import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUpcomingGames } from '../caching/listCache';
import GameListItem from './GameListItem';
import browseByStyles from '../styles/browseByStyles';

const UpcomingGames = (props) => {
    const navigation = props.navigation || useNavigation();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUpcomingGames = async () => {
            try {
                const today = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
                const allGames = await getUpcomingGames();
                const upcoming = allGames.filter(
                    (game) => game.first_release_date && game.first_release_date > today
                );
                setGames(upcoming);
            } catch (err) {
                setError('Failed to load upcoming games.');
            } finally {
                setLoading(false);
            }
        };
        fetchUpcomingGames();
    }, []);

    const handleGamePress = (game) => {
        navigation.navigate('RateGame', { gameId: game.id || game.firebaseKey });
    };

    if (loading) {
        return (
            <View style={browseByStyles.container}>
                <ActivityIndicator size="large" color="#888" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={browseByStyles.container}>
                <Text>{error}</Text>
            </View>
        );
    }

    if (!games.length) {
        return (
            <View style={browseByStyles.container}>
                <Text>No upcoming games found.</Text>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={browseByStyles.gameCard}
            onPress={() => handleGamePress(item)}
            activeOpacity={0.8}
        >
            <GameListItem game={item} />
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={games}
            keyExtractor={(item) => (item.id ? item.id.toString() : String(item.firebaseKey))}
            numColumns={4}
            renderItem={renderItem}
            columnWrapperStyle={browseByStyles.gridRow}
            contentContainerStyle={browseByStyles.scrollContent}
            style={browseByStyles.scrollView}
        />
    );
};

export default UpcomingGames;
