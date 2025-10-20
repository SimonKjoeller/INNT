import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { libraryStyles } from '../styles/libraryStyles';

// Konverter og rund rating til 1 decimal — sørg for tal-typen
const formatRating = (rating) => {
    const num = Number(rating) || 0;
    return Math.round(num * 10) / 10;
};

const GameListItem = ({
    game,
    type, // 'wishlist' or 'rated'
    onPress,
    showRating = false,
    showAddedDate = false
}) => {

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleDateString('da-DK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderStars = (rating) => {
        // Sørg for tal og konverter fra 0-10 skala til 0-5 skala for visuelle stjerner
        const num = Number(rating) || 0;
        const normalizedRating = Math.round((num / 10) * 5);
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Icon
                    key={i}
                    name={i <= normalizedRating ? 'star' : 'star-outline'}
                    size={14}
                    color="#FFD700"
                />
            );
        }
        return stars;
    };

    return (
        <TouchableOpacity
            style={libraryStyles.gameItem}
            onPress={() => onPress && onPress(game)}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: game.coverUrl || game.cover_url }}
                style={libraryStyles.gameImage}
                resizeMode="cover"
            />

            <View style={libraryStyles.gameInfo}>
                <Text
                    style={libraryStyles.gameName}
                    numberOfLines={2}
                >
                    {game.name || game.game_name}
                </Text>

                {game.developer && (
                    <Text style={libraryStyles.gameDetails}>
                        {game.developer}
                    </Text>
                )}

                {game.releaseDate && (
                    <Text style={libraryStyles.gameDetails}>
                        {new Date(game.releaseDate).getFullYear()}
                    </Text>
                )}

                {showRating && game.rating && (
                    <View style={libraryStyles.ratingContainer}>
                        {renderStars(game.rating)}
                        <Text style={libraryStyles.ratingText}>
                            {formatRating(game.rating).toFixed(1)}/10
                        </Text>
                    </View>
                )}

                {showAddedDate && (game.added_timestamp || game.timestamp) && (
                    <Text style={libraryStyles.addedDate}>
                        Tilføjet: {formatDate(game.added_timestamp || game.timestamp)}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default GameListItem;
