import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const browseByStyles = StyleSheet.create({
    customBackground: {
        backgroundColor: '#0f0f0f',
    },
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    gridRow: {
        justifyContent: 'space-between',
    },
    gameCard: {
        width: (width - 96) / 4,
        backgroundColor: '#2d2d30',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    gameImage: {
        width: '100%',
        height: 115,
        resizeMode: 'cover',
    },
});

export default browseByStyles;


