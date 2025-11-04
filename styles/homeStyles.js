import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const popularGamesStyles = StyleSheet.create({
    homeContainer: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#aaa',
        fontSize: 16,
        marginTop: 5,
    },
    container: {
        marginVertical: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 11,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    arrow: {
        color: '#8E8E93',
        fontSize: 24,
        fontWeight: 'bold',
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
        width: width * 0.264, // 10% larger than 24%
        marginRight: 9,
    },
    gameImage: {
        width: '100%',
        height: width * 0.396, // 10% larger than 0.36
        borderRadius: 8,
    },
    gameInfo: {
        marginTop: 8,
        paddingHorizontal: 2,
    },
    gameName: {
        color: '#fff',
        fontSize: 13.2,
        fontWeight: '600',
        marginBottom: 3.3,
        lineHeight: 16.5,
    },
    reviewCount: {
        color: '#aaa',
        fontSize: 12,
    },
});