import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, ScrollView, Modal, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import { getDatabase, ref, child, get, set, update, query, orderByChild, equalTo, push } from 'firebase/database';
import Icon from 'react-native-vector-icons/Ionicons';
import { firebaseApp } from '../database/firebase';
import styles from '../styles/screenStyles';
import { rateGameComponentStyles, rateGameStyles } from '../styles/RateGameStyles';


const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.getFullYear();
};

const getGameInternalId = (gameData, gameIdStr) => {
    return gameData?.id || gameIdStr;
};

const createLoadingView = (message = "Loading...") => (
    <View style={rateGameStyles.loadingContainer}>
        <Text style={rateGameStyles.loadingText}>{message}</Text>
    </View>
);

// ===== GAME LIST COMPONENT =====
export const RateGameList = ({ navigation }) => {
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

    const renderGameItem = ({ item }) => (
        <TouchableOpacity
            style={rateGameComponentStyles.gameItem}
            onPress={() => handleGameSelect(item.id)}
        >
            <Image
                source={{ uri: item.coverUrl }}
                style={rateGameComponentStyles.gameCover}
                resizeMode="cover"
            />
            <View style={rateGameComponentStyles.gameInfo}>
                <Text style={rateGameComponentStyles.gameName}>{item.name}</Text>
                <Text style={rateGameComponentStyles.gameYear}>
                    {formatDate(item.first_release_date)}
                </Text>
                <Text style={rateGameComponentStyles.gameReviews}>
                    {item.reviewCount || 0} reviews
                </Text>
            </View>
            <Text style={rateGameComponentStyles.arrow}>→</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return createLoadingView("Loading games...");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎮 Games to Rate</Text>
            <Text style={rateGameComponentStyles.subtitle}>Tap on a game to rate it</Text>

            <FlatList
                data={games}
                keyExtractor={(item) => item.id}
                renderItem={renderGameItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={rateGameComponentStyles.listContainer}
            />
        </View>
    );
};

// ===== RATING MODAL COMPONENT =====
const RatingModal = ({ visible, onClose, gameData, onSubmitRating }) => {
    const [rating, setRating] = useState(5.0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        onSubmitRating(rating, comment);
        setRating(5.0);
        setComment('');
        onClose();
    };

    const handleOverlayPress = () => {
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={rateGameStyles.modalOverlay}
                onPress={handleOverlayPress}
                activeOpacity={1}
            >
                <TouchableOpacity
                    style={rateGameStyles.modalContainer}
                    onPress={() => { }} // Prevent modal close when clicking inside
                    activeOpacity={1}
                >
                    <Text style={rateGameStyles.modalTitle}>Rate {gameData?.name}</Text>

                    <Text style={rateGameStyles.ratingLabel}>Rating: {rating.toFixed(1)}/10</Text>
                    <View style={rateGameStyles.sliderContainer}>
                        <Text style={rateGameStyles.sliderLabel}>0</Text>
                        <Slider
                            style={rateGameStyles.slider}
                            minimumValue={0}
                            maximumValue={10}
                            value={rating}
                            onValueChange={setRating}
                            step={0.1}
                            minimumTrackTintColor="#FFD700"
                            maximumTrackTintColor="#666"
                            thumbStyle={rateGameStyles.sliderThumb}
                        />
                        <Text style={rateGameStyles.sliderLabel}>10</Text>
                    </View>

                    <Text style={rateGameStyles.commentLabel}>Comment (optional):</Text>
                    <TextInput
                        style={rateGameStyles.commentInput}
                        value={comment}
                        onChangeText={setComment}
                        placeholder="What did you think about this game?"
                        placeholderTextColor="#666"
                        multiline={true}
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <View style={rateGameStyles.modalButtons}>
                        <TouchableOpacity
                            style={rateGameStyles.modalButtonCancel}
                            onPress={onClose}
                        >
                            <Text style={rateGameStyles.modalButtonTextCancel}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={rateGameStyles.modalButtonSubmit}
                            onPress={handleSubmit}
                        >
                            <Text style={rateGameStyles.modalButtonTextSubmit}>Submit Rating</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

// ===== GAME DETAIL COMPONENT =====
export const RateGameDetail = ({ gameId, navigation }) => {
    const gameIdStr = String(gameId);
    const [gameData, setGameData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);

    useEffect(() => {
        if (gameIdStr) {
            fetchGameData();
        }
    }, [gameIdStr]);

    const fetchGameData = async () => {
        try {
            const database = getDatabase(firebaseApp);
            const gameRef = ref(database, `games/${gameIdStr}`);
            const gameSnapshot = await get(gameRef);

            if (!gameSnapshot.exists()) {
                Alert.alert('Error', 'Game not found');
                setLoading(false);
                return;
            }

            const gameData = gameSnapshot.val();
            setGameData(gameData);
        } catch (error) {
            console.error('Error fetching game data:', error);
            Alert.alert('Error', 'Failed to load game data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRating = async (rating, comment) => {
        try {
            const database = getDatabase(firebaseApp);
            const ratingsRef = ref(database, 'userRatings');
            const gameInternalId = getGameInternalId(gameData, gameIdStr);

            // Tjek for eksisterende rating
            const existingSnapshot = await get(ratingsRef);
            let existingRatingKey = null;

            if (existingSnapshot.exists()) {
                const ratings = existingSnapshot.val();
                const existingEntry = Object.entries(ratings).find(
                    ([key, ratingObj]) => ratingObj.game_id === gameInternalId && ratingObj.user_id === 'user1'
                );
                if (existingEntry) {
                    existingRatingKey = existingEntry[0];
                }
            }

            const ratingData = {
                game_id: gameInternalId,
                user_id: 'user1',
                rating: rating, // 0-10 med decimaler
                comment: comment || null,
                timestamp: new Date().toISOString(),
            };

            if (existingRatingKey) {
                await set(ref(database, `userRatings/${existingRatingKey}`), ratingData);
                console.log('✅ Updated rating:', rating);
            } else {
                await set(push(ratingsRef), ratingData);
                console.log('✅ Created rating:', rating);
            }

            Alert.alert('Success', `Rating saved: ${rating}/10`);
        } catch (error) {
            console.error('Error saving rating:', error);
            Alert.alert('Error', 'Failed to save rating');
        }
    };

    const handleAddToWishlist = async () => {
        try {
            const database = getDatabase(firebaseApp);
            const wishlistRef = ref(database, 'userWishlist');
            const gameInternalId = getGameInternalId(gameData, gameIdStr);

            const wishlistData = {
                game_id: gameInternalId,
                user_id: 'user1',
                game_name: gameData.name,
                added_timestamp: new Date().toISOString(),
            };

            await set(push(wishlistRef), wishlistData);
            Alert.alert('Success', `${gameData.name} added to your wishlist!`);
            console.log('✅ Added to wishlist:', gameData.name);
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            Alert.alert('Error', 'Failed to add to wishlist');
        }
    };

    if (loading) return createLoadingView();
    if (!gameData) return createLoadingView("Game not found");

    return (
        <ScrollView style={rateGameStyles.container}>
            {/* Header Image */}
            <View style={rateGameStyles.headerContainer}>
                <Image
                    source={{ uri: gameData.artworkUrls?.[0] || gameData.coverUrl }}
                    style={rateGameStyles.headerImage}
                    resizeMode="cover"
                />
            </View>

            {/* Content */}
            <View style={rateGameStyles.contentContainer}>
                <View style={rateGameStyles.gameInfoContainer}>
                    <Text style={rateGameStyles.gameTitle}>{gameData.name}</Text>
                    <Text style={rateGameStyles.gameYear}>
                        {formatDate(gameData.first_release_date)}
                    </Text>

                    {/* Summary starter her ved siden af game info */}
                    <Text style={rateGameStyles.summaryInline}>
                        {gameData.summary || 'No summary available.'}
                    </Text>
                </View>

                <Image
                    source={{ uri: gameData.coverUrl }}
                    style={rateGameStyles.gameCover}
                    resizeMode="cover"
                />
            </View>

            {/* Action Buttons */}
            <View style={rateGameStyles.actionButtonsContainer}>
                <TouchableOpacity
                    style={rateGameStyles.rateButton}
                    onPress={() => setRatingModalVisible(true)}
                >
                    <Icon name="star" size={20} color="#FFD700" />
                    <Text style={rateGameStyles.rateButtonText}>Rate Game</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={rateGameStyles.wishlistButton}
                    onPress={handleAddToWishlist}
                >
                    <Icon name="bookmark" size={20} color="#4CAF50" />
                    <Text style={rateGameStyles.wishlistButtonText}>Add to Wishlist</Text>
                </TouchableOpacity>
            </View>

            {/* Rating Modal */}
            <RatingModal
                visible={ratingModalVisible}
                onClose={() => setRatingModalVisible(false)}
                gameData={gameData}
                onSubmitRating={handleSubmitRating}
            />
        </ScrollView>
    );
};

// Default export for backward compatibility (list component)
export default RateGameList;