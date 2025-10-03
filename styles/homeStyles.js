import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const popularGamesStyles = StyleSheet.create({
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
});