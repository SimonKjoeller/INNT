import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { firebaseApp } from '../database/firebase';
import styles from '../styles/screenStyles';

const RateGameComponent = ({ navigation }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            const database = getDatabase(firebaseApp);
            const gamesRef = ref(database, 'games');
            const snapshot = await get(gamesRef);
            
            if (snapshot.exists()) {
                const gamesData = snapshot.val();
                // Konverter object til array med keys som id
                const gamesArray = Object.keys(gamesData).map(key => ({
                    id: key,
                    ...gamesData[key]
                }));
                setGames(gamesArray);
            } else {
                Alert.alert('Info', 'No games found in database');
            }
        } catch (error) {
            console.error('Error fetching games:', error);
            Alert.alert('Error', 'Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const handleGameSelect = (gameId) => {
        navigation.navigate('RateGame', { gameId });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.getFullYear();
    };

    const renderGameItem = ({ item }) => (
        <TouchableOpacity
            style={gameItemStyles.gameItem}
            onPress={() => handleGameSelect(item.id)}
        >
            <Image
                source={{ uri: item.coverUrl }}
                style={gameItemStyles.gameCover}
                resizeMode="cover"
            />
            <View style={gameItemStyles.gameInfo}>
                <Text style={gameItemStyles.gameName}>{item.name}</Text>
                <Text style={gameItemStyles.gameYear}>
                    {formatDate(item.first_release_date)}
                </Text>
                <Text style={gameItemStyles.gameReviews}>
                    {item.reviewCount || 0} reviews
                </Text>
            </View>
            <Text style={gameItemStyles.arrow}>→</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.title}>Loading games...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎮 Games to Rate</Text>
            <Text style={gameItemStyles.subtitle}>Tap on a game to rate it</Text>

            <FlatList
                data={games}
                keyExtractor={(item) => item.id}
                renderItem={renderGameItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={gameItemStyles.listContainer}
            />
        </View>
    );
};

const gameItemStyles = {
    listContainer: {
        paddingBottom: 20,
    },
    subtitle: {
        color: '#aaa',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    gameItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 10,
        padding: 15,
    },
    gameCover: {
        width: 60,
        height: 80,
        borderRadius: 5,
        marginRight: 15,
    },
    gameInfo: {
        flex: 1,
    },
    gameName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    gameYear: {
        color: '#aaa',
        fontSize: 14,
        marginBottom: 3,
    },
    gameReviews: {
        color: '#666',
        fontSize: 12,
    },
    arrow: {
        color: '#fff',
        fontSize: 20,
        marginLeft: 10,
    },
};

export default RateGameComponent;