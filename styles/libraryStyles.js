import { StyleSheet } from 'react-native';

export const libraryStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },

    // Tab Navigation Styles
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#2d2d2d',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    tabDivider: {
        width: 1,
        backgroundColor: '#3a3a3a',
        opacity: 0.8,
    },

    tabButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    activeTab: {
        backgroundColor: '#6C5CE7',
    },

    inactiveTab: {
        backgroundColor: 'transparent',
    },

    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#ffffff',
    },

    activeTabText: {
        color: '#ffffff',
    },

    inactiveTabText: {
        color: '#888888',
    },

    // Content Styles
    contentContainer: {
        flex: 1,
        marginTop: 20,
    },

    // Game List Styles
    gamesList: {
        paddingHorizontal: 20,
    },

    gameItem: {
        flexDirection: 'row',
        backgroundColor: '#2d2d2d',
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        alignItems: 'center',
    },

    gameImage: {
        width: 60,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },

    gameInfo: {
        flex: 1,
    },

    gameName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },

    gameDetails: {
        fontSize: 12,
        color: '#888888',
        marginBottom: 2,
    },

    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },

    ratingText: {
        fontSize: 14,
        color: '#FFD700',
        fontWeight: '600',
        marginLeft: 4,
    },

    addedDate: {
        fontSize: 12,
        color: '#666666',
        fontStyle: 'italic',
    },

    // Empty State Styles
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },

    emptyIcon: {
        marginBottom: 16,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },

    emptySubtitle: {
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Loading Styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingText: {
        fontSize: 16,
        color: '#888888',
        marginTop: 10,
    },
});

export default libraryStyles;
