import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { getDatabase, ref, child, get, set, update } from 'firebase/database';
import Icon from 'react-native-vector-icons/Ionicons';
import { rateGameStyles } from '../styles/RateGameStyles';
import { firebaseApp } from '../database/firebase';

const RateGameScreen = ({ route, navigation }) => {
    const { gameId } = route.params || { gameId: '1' }; // Default til spil ID 1 hvis ingen param
    const [gameData, setGameData] = useState(null);
    const [userRating, setUserRating] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGameData();
    }, [gameId]);

    const fetchGameData = async () => {
        try {
            const database = getDatabase(firebaseApp);
            const gameRef = ref(database, `games/${gameId}`);
            const userRatingRef = ref(database, `userRatings/${gameId}/user1`);
            
            // Hent spil data og bruger rating parallelt
            const [gameSnapshot, ratingSnapshot] = await Promise.all([
                get(gameRef),
                get(userRatingRef)
            ]);
            
            if (gameSnapshot.exists()) {
                setGameData(gameSnapshot.val());
            } else {
                Alert.alert('Error', 'Game not found');
            }

            if (ratingSnapshot.exists()) {
                setUserRating(ratingSnapshot.val().rating);
            }
        } catch (error) {
            console.error('Error fetching game data:', error);
            Alert.alert('Error', 'Failed to load game data');
        } finally {
            setLoading(false);
        }
    };

    const saveUserRating = async (rating) => {
        try {
            const database = getDatabase(firebaseApp);
            const userRatingRef = ref(database, `userRatings/${gameId}/user1`); // user1 som temp bruger
            
            await set(userRatingRef, {
                rating: rating,
                timestamp: new Date().toISOString(),
            });
            
            Alert.alert('Success', `You rated this game ${rating} stars!`);
        } catch (error) {
            console.error('Error saving rating:', error);
            Alert.alert('Error', 'Failed to save rating');
        }
    };

    const handleStarPress = (rating) => {
        setUserRating(rating);
        saveUserRating(rating);
    };

    const renderStars = (rating, interactive = false) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={interactive ? () => handleStarPress(i) : null}
                    disabled={!interactive}
                    style={rateGameStyles.starButton}
                >
                    <Icon
                        name={i <= rating ? 'star' : 'star-outline'}
                        size={interactive ? 32 : 24}
                        color={i <= rating ? '#FFD700' : '#666'}
                    />
                </TouchableOpacity>
            );
        }
        return stars;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.getFullYear();
    };

    if (loading) {
        return (
            <View style={rateGameStyles.loadingContainer}>
                <Text style={rateGameStyles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!gameData) {
        return (
            <View style={rateGameStyles.loadingContainer}>
                <Text style={rateGameStyles.loadingText}>Game not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={rateGameStyles.container}>
            {/* Header Image */}
            <View style={rateGameStyles.headerContainer}>
                <Image
                    source={{ uri: gameData.coverUrl }}
                    style={rateGameStyles.headerImage}
                    resizeMode="cover"
                />

                {/* Back Button */}
                <TouchableOpacity
                    style={rateGameStyles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Menu Button */}
                <TouchableOpacity style={rateGameStyles.menuButton}>
                    <Icon name="ellipsis-horizontal" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={rateGameStyles.contentContainer}>
                {/* Game Info */}
                <View style={rateGameStyles.gameInfoContainer}>
                    <Text style={rateGameStyles.gameTitle}>{gameData.name}</Text>
                    <Text style={rateGameStyles.gameYear}>
                        {formatDate(gameData.first_release_date)}
                    </Text>

                    {/* Trailer Button */}
                    <TouchableOpacity style={rateGameStyles.trailerButton}>
                        <Icon name="play" size={16} color="#fff" />
                        <Text style={rateGameStyles.trailerText}>TRAILER</Text>
                    </TouchableOpacity>
                </View>

                {/* Game Cover */}
                <Image
                    source={{ uri: gameData.coverUrl }}
                    style={rateGameStyles.gameCover}
                    resizeMode="cover"
                />
            </View>

            {/* Tagline */}
            <Text style={rateGameStyles.tagline}>
                SOME SEARCH FOR BATTLE, OTHERS ARE BORN INTO IT.
            </Text>

            {/* Summary */}
            <Text style={rateGameStyles.summary}>
                {gameData.summary || 'No summary available.'}
            </Text>

            {/* Ratings */}
            <View style={rateGameStyles.ratingsContainer}>
                <Text style={rateGameStyles.ratingsTitle}>RATINGS</Text>
                <View style={rateGameStyles.ratingBar}>
                    <Text style={rateGameStyles.ratingValue}>4.4</Text>
                    <View style={rateGameStyles.starsContainer}>
                        {renderStars(4.4)}
                    </View>
                </View>
                <Text style={rateGameStyles.reviewCount}>
                    {gameData.reviewCount || 0} reviews
                </Text>
            </View>

            {/* User Rating Section */}
            <View style={rateGameStyles.userRatingContainer}>
                <Text style={rateGameStyles.userRatingTitle}>Your Rating:</Text>
                <View style={rateGameStyles.userStarsContainer}>
                    {renderStars(userRating, true)}
                </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity style={rateGameStyles.actionButton}>
                <Icon name="person-circle-outline" size={24} color="#fff" />
                <Text style={rateGameStyles.actionButtonText}>
                    Rate, log, review, add to list + more
                </Text>
                <Icon name="ellipsis-horizontal" size={24} color="#fff" />
            </TouchableOpacity>
        </ScrollView>
    );
};

export default RateGameScreen;
