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

    // Sort Bar
    sortTopBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        marginTop: 8,
        position: 'relative',
    },
    sortIconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#242424',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#333',
    },
    sortCurrentText: {
        color: '#bbb',
        fontSize: 12,
        fontWeight: '700',
    },
    sortMenuDropdown: {
        position: 'absolute',
        top: 36,
        right: 20,
        backgroundColor: '#232323',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#3a3a3a',
        paddingVertical: 6,
        width: 160,
        zIndex: 1000,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    sortMenuItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    sortMenuItemActive: {
        backgroundColor: '#2c2c2c',
    },
    sortMenuItemInactive: {
        backgroundColor: 'transparent',
    },
    sortMenuItemText: {
        fontSize: 13,
        fontWeight: '700',
    },
    sortMenuItemTextActive: { color: '#ffffff' },
    sortMenuItemTextInactive: { color: '#bbbbbb' },
    sortButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    sortButtonActive: {
        backgroundColor: '#3a2fe2',
        borderColor: '#6C5CE7',
    },
    sortButtonInactive: {
        backgroundColor: '#2a2a2a',
        borderColor: '#3a3a3a',
    },
    sortButtonText: {
        fontSize: 12,
        fontWeight: '700',
    },
    sortButtonTextActive: {
        color: '#fff',
    },
    sortButtonTextInactive: {
        color: '#bbb',
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
