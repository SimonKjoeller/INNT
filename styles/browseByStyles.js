import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const browseByStyles = StyleSheet.create({
    gameImagePlaceholder: {
        width: '100%',
        height: 115 * 1.1025, // 5% larger than previous 1.05 multiplier
        backgroundColor: '#cccccc',
        borderRadius: 8,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 0,
        marginBottom: 18,
    },
    footerLoading: {
        paddingVertical: 16,
    },
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
        flexDirection: 'row',
        justifyContent: 'center',
        marginRight: 8,
    },
    gameCard: {
        width: ((width - 96) / 4) * 1.13, // 5% larger than previous 1.05 multiplier
        backgroundColor: '#2d2d30',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginLeft: 2,
        marginRight: 8,
    },
    gameImage: {
        width: '100%',
        height: 115 * 1.13, // 5% larger than previous 1.05 multiplier
        resizeMode: 'cover',
    },
});

export default browseByStyles;


