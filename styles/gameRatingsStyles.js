import { StyleSheet } from 'react-native';

export const gameRatingsStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    listContent: {
        paddingBottom: 8,
        gap: 10,
    },
    filterBar: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    filterButton: {
        flex: 1,
        backgroundColor: '#262626',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    filterButtonActive: {
        backgroundColor: '#33325a',
        borderColor: '#6C5CE7',
    },
    filterText: {
        color: '#aaa',
        fontSize: 12,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#fff',
    },
    itemContainer: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    displayName: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
        maxWidth: '70%',
    },
    timestamp: {
        color: '#aaa',
        fontSize: 12,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    numericRating: {
        color: '#FFD700',
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 2,
    },
    commentText: {
        color: '#ddd',
        fontSize: 13,
        lineHeight: 18,
    },
    voteRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    voteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#242424',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    voteButtonUpActive: {
        borderColor: '#4CAF50',
        backgroundColor: '#1f2a21',
    },
    voteButtonDownActive: {
        borderColor: '#E57373',
        backgroundColor: '#2a1f1f',
    },
    voteCount: {
        color: '#aaa',
        fontSize: 12,
        fontWeight: '700',
    },
    voteCountUpActive: { color: '#4CAF50' },
    voteCountDownActive: { color: '#E57373' },
    loadMoreButton: {
        alignSelf: 'center',
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#333',
    },
    loadMoreText: {
        color: '#bbb',
        fontSize: 12,
        fontWeight: '600',
    },
    loadingContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    loadingText: {
        color: '#aaa',
        fontSize: 13,
    },
    emptyContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 13,
    },
});

export default gameRatingsStyles;


