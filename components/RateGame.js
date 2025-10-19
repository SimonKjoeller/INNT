import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, ScrollView, Modal, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';

import { ref, child, get, set, update, query, orderByChild, equalTo, push } from 'firebase/database';


import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../database/firebase';
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

const formatRating = (rating) => {
    return Math.round(rating * 10) / 10;
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
            const gamesRef = ref(db, 'games');
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
const RatingModal = ({ visible, onClose, gameData, onSubmitRating, existingRating }) => {
    const [rating, setRating] = useState(existingRating?.rating || 5.0);
    const [comment, setComment] = useState(existingRating?.comment || '');

    // Opdater state når existingRating ændres
    useEffect(() => {
        if (existingRating) {
            setRating(existingRating.rating);
            setComment(existingRating.comment || '');
        } else {
            setRating(5.0);
            setComment('');
        }
    }, [existingRating]);

    const handleRatingChange = (newRating) => {
        setRating(newRating);
        // Subtil haptic feedback ved rating ændring
        Haptics.selectionAsync();
    };

    const handleSubmit = () => {
        onSubmitRating(rating, comment);
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
                    <Text style={rateGameStyles.modalTitle}>
                        {existingRating ? `Update Rating for ${gameData?.name}` : `Rate ${gameData?.name}`}
                    </Text>

                    <Text style={rateGameStyles.ratingLabel}>Rating: {formatRating(rating).toFixed(1)}/10</Text>
                    <View style={rateGameStyles.sliderContainer}>
                        <Text style={rateGameStyles.sliderLabel}>0</Text>
                        <Slider
                            style={rateGameStyles.slider}
                            minimumValue={0}
                            maximumValue={10}
                            value={rating}
                            onValueChange={handleRatingChange}
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
                            <Text style={rateGameStyles.modalButtonTextSubmit}>
                                {existingRating ? 'Update Rating' : 'Submit Rating'}
                            </Text>
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
    const [isOnWishlist, setIsOnWishlist] = useState(false);
    const [wishlistKey, setWishlistKey] = useState(null);
    const [existingRating, setExistingRating] = useState(null);

    useEffect(() => {
        if (gameIdStr) {
            fetchGameData();
            checkWishlistStatus();
            checkExistingRating();
        }
    }, [gameIdStr]);

    const fetchGameData = async () => {
        try {
            const gameRef = ref(db, `games/${gameIdStr}`);
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

    const checkWishlistStatus = async () => {
        try {
            const database = getDatabase(firebaseApp);
            const wishlistRef = ref(database, 'userWishlist');
            const wishlistQuery = query(wishlistRef, orderByChild('user_id'), equalTo('user1'));
            const wishlistSnapshot = await get(wishlistQuery);

            if (wishlistSnapshot.exists()) {
                const wishlistData = wishlistSnapshot.val();
                // gameIdStr er Firebase key, så vi henter game data først for at få internal ID
                const gameRef = ref(database, `games/${gameIdStr}`);
                const gameSnapshot = await get(gameRef);
                const gameInternalId = gameSnapshot.exists() ? gameSnapshot.val().id : gameIdStr;

                const existingEntry = Object.entries(wishlistData).find(
                    ([key, wishlistItem]) => wishlistItem.game_id === gameInternalId
                );

                if (existingEntry) {
                    setIsOnWishlist(true);
                    setWishlistKey(existingEntry[0]);
                } else {
                    setIsOnWishlist(false);
                    setWishlistKey(null);
                }
            } else {
                setIsOnWishlist(false);
                setWishlistKey(null);
            }
        } catch (error) {
            console.error('Error checking wishlist status:', error);
            setIsOnWishlist(false);
            setWishlistKey(null);
        }
    };

    const checkExistingRating = async () => {
        try {
            const database = getDatabase(firebaseApp);
            const ratingsRef = ref(database, 'userRatings');
            const ratingsQuery = query(ratingsRef, orderByChild('user_id'), equalTo('user1'));
            const ratingsSnapshot = await get(ratingsQuery);

            if (ratingsSnapshot.exists()) {
                const ratingsData = ratingsSnapshot.val();
                // gameIdStr er Firebase key, så vi henter game data først for at få internal ID
                const gameRef = ref(database, `games/${gameIdStr}`);
                const gameSnapshot = await get(gameRef);
                const gameInternalId = gameSnapshot.exists() ? gameSnapshot.val().id : gameIdStr;

                const existingEntry = Object.entries(ratingsData).find(
                    ([key, ratingItem]) => ratingItem.game_id === gameInternalId
                );

                if (existingEntry) {
                    const [ratingKey, ratingData] = existingEntry;
                    setExistingRating({
                        key: ratingKey,
                        rating: ratingData.rating,
                        comment: ratingData.comment || ''
                    });
                } else {
                    setExistingRating(null);
                }
            } else {
                setExistingRating(null);
            }
        } catch (error) {
            console.error('Error checking existing rating:', error);
            setExistingRating(null);
        }
    };

    const handleSubmitRating = async (rating, comment) => {
        try {
            const ratingsRef = ref(db, 'userRatings');
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

            const roundedRating = formatRating(rating); // Rund til 1 decimal for at undgå floating point fejl

            const ratingData = {
                game_id: gameInternalId,
                user_id: 'user1',
                rating: roundedRating,
                comment: comment || null,
                timestamp: new Date().toISOString(),
            };

            if (existingRatingKey) {
                await set(ref(db, `userRatings/${existingRatingKey}`), ratingData);
                console.log('✅ Updated rating:', rating);
            } else {
                await set(push(ratingsRef), ratingData);
                console.log('✅ Created rating:', roundedRating);
            }

            Alert.alert('Success', `Rating saved: ${roundedRating}/10`);
            // Opdater eksisterende rating state
            checkExistingRating();
        } catch (error) {
            console.error('Error saving rating:', error);
            Alert.alert('Error', 'Failed to save rating');
        }
    };

    const handleToggleWishlist = async () => {
        try {
            const wishlistRef = ref(db, 'userWishlist');
            const gameInternalId = getGameInternalId(gameData, gameIdStr);

            if (isOnWishlist && wishlistKey) {
                // Fjern fra wishlist
                const wishlistItemRef = ref(database, `userWishlist/${wishlistKey}`);
                await set(wishlistItemRef, null);

                setIsOnWishlist(false);
                setWishlistKey(null);
                Alert.alert('Success', `${gameData.name} removed from your wishlist!`);
                console.log('✅ Removed from wishlist:', gameData.name);
            } else {
                // Tilføj til wishlist
                const wishlistRef = ref(database, 'userWishlist');
                const wishlistData = {
                    game_id: gameInternalId,
                    user_id: 'user1',
                    game_name: gameData.name,
                    added_timestamp: new Date().toISOString(),
                };

                const newWishlistRef = push(wishlistRef);
                await set(newWishlistRef, wishlistData);

                setIsOnWishlist(true);
                setWishlistKey(newWishlistRef.key);
                Alert.alert('Success', `${gameData.name} added to your wishlist!`);
                console.log('✅ Added to wishlist:', gameData.name);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            Alert.alert('Error', 'Failed to update wishlist');
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
                    <Text style={rateGameStyles.rateButtonText}>
                        {existingRating ? 'Update Rating' : 'Rate Game'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        rateGameStyles.wishlistButton,
                        isOnWishlist && rateGameStyles.wishlistButtonActive
                    ]}
                    onPress={handleToggleWishlist}
                >
                    <Icon
                        name={isOnWishlist ? "bookmark" : "bookmark-outline"}
                        size={20}
                        color={isOnWishlist ? "#FF6B6B" : "#4CAF50"}
                    />
                    <Text style={[
                        rateGameStyles.wishlistButtonText,
                        isOnWishlist && rateGameStyles.wishlistButtonTextActive
                    ]}>
                        {isOnWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Rating Modal */}
            <RatingModal
                visible={ratingModalVisible}
                onClose={() => setRatingModalVisible(false)}
                gameData={gameData}
                onSubmitRating={handleSubmitRating}
                existingRating={existingRating}
            />
        </ScrollView>
    );
};

// Default export for backward compatibility (list component)
export default RateGameList;