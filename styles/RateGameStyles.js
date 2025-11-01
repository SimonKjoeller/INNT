import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Shared constants
const COLORS = {
    background: '#1a1a1a',
    backgroundSecondary: '#2a2a2a',
    textPrimary: '#fff',
    textSecondary: '#aaa',
    textTertiary: '#666',
    textContent: '#ccc',
    accent: '#2a5298',
    overlay: 'rgba(0,0,0,0.3)',
    buttonOverlay: 'rgba(255,255,255,0.2)',
};

const SPACING = {
    xs: 5,
    sm: 10,
    md: 15,
    lg: 20,
    xl: 30,
};

// Shared/Base styles
const baseStyles = {
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        color: COLORS.textPrimary,
        fontSize: 18,
    },
    gameInfoBase: {
        flex: 1,
    },
    gameNameBase: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    gameYearBase: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
};

// RateGameScreen (Detail View) Styles
export const rateGameStyles = StyleSheet.create({
    ...baseStyles,
    headerContainer: {
        position: 'relative',
        height: height * 0.4,
        width: '100%',
    },
    headerImage: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    headerBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.35,
    },
    headerGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: SPACING.lg,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuButton: {
        position: 'absolute',
        top: 50,
        right: SPACING.lg,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    gameInfoContainer: {
        ...baseStyles.gameInfoBase,
        paddingRight: SPACING.lg,
    },
    gameTitle: {
        ...baseStyles.gameNameBase,
        fontSize: 24,
    },
    gameYear: {
        ...baseStyles.gameYearBase,
        fontSize: 16,
        marginBottom: SPACING.md,
    },
    gameCompany: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: SPACING.md,
    },
    madeByLabel: {
        color: COLORS.textTertiary,
        fontSize: 12,
        marginTop: 2,
    },
    gameCover: {
        width: 120,
        height: 180,
        borderRadius: SPACING.sm,
        marginTop: -70,
        borderWidth: 1,
        borderColor: '#333',
    },
    trailerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.buttonOverlay,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        borderRadius: SPACING.lg,
        alignSelf: 'flex-start',
    },
    trailerText: {
        color: COLORS.textPrimary,
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: SPACING.xs,
    },
    tagline: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
        letterSpacing: 1,
    },
    summaryInline: {
        color: COLORS.textContent,
        fontSize: 14,
        lineHeight: 18,
        marginTop: SPACING.md,
        flex: 1,
    },
    fullSummaryContainer: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    collapsedSummaryContainer: {
        position: 'relative',
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.sm,
        marginBottom: SPACING.lg,
        overflow: 'hidden',
    },
    summaryFull: {
        color: COLORS.textContent,
        fontSize: 14,
        lineHeight: 20,
    },
    summaryFade: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 24,
        // Simple fade hint without extra deps: solid overlay with high opacity near bottom
        // Gives a subtle indication there is more content
        backgroundColor: 'rgba(26,26,26,0.9)',
    },
    // Action Buttons Section  
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        gap: SPACING.md,
    },
    rateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2a2a2a',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    rateButtonText: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    wishlistButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2a2a2a',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    wishlistButtonText: {
        color: '#4CAF50',
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    wishlistButtonActive: {
        borderColor: '#FF6B6B',
        backgroundColor: '#2a1f1f',
    },
    wishlistButtonTextActive: {
        color: '#FF6B6B',
    },
    playedButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2a2a2a',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#03A9F4',
    },
    playedButtonText: {
        color: '#03A9F4',
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    playedButtonActive: {
        borderColor: '#00BCD4',
        backgroundColor: '#1f2a2e',
    },
    playedButtonTextActive: {
        color: '#00BCD4',
    },
    // Rating Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: 16,
        padding: SPACING.xl,
        marginHorizontal: SPACING.lg,
        width: '85%',
    },
    modalTitle: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    ratingLabel: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        gap: SPACING.md,
    },
    sliderLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    slider: {
        flex: 1,
        height: 40,
    },
    sliderThumb: {
        backgroundColor: '#FFD700',
        width: 20,
        height: 20,
    },
    commentLabel: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    commentInput: {
        backgroundColor: COLORS.background,
        color: COLORS.textPrimary,
        fontSize: 14,
        padding: SPACING.md,
        borderRadius: 8,
        marginBottom: SPACING.xl,
        minHeight: 80,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    modalButtonCancel: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: SPACING.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonTextCancel: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    modalButtonSubmit: {
        flex: 1,
        backgroundColor: COLORS.accent,
        paddingVertical: SPACING.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonTextSubmit: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
});

// RateGame Component (List View) Styles
export const rateGameComponentStyles = StyleSheet.create({
    ...baseStyles,
    listContainer: {
        paddingBottom: SPACING.lg,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    gameItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        borderRadius: SPACING.sm,
        padding: SPACING.md,
    },
    gameCover: {
        width: 60,
        height: 80,
        borderRadius: SPACING.xs,
        marginRight: SPACING.md,
    },
    gameInfo: baseStyles.gameInfoBase,
    gameName: {
        ...baseStyles.gameNameBase,
        fontSize: 18,
    },
    gameYear: {
        ...baseStyles.gameYearBase,
        marginBottom: 3,
    },
    gameReviews: {
        color: COLORS.textTertiary,
        fontSize: 12,
    },
    arrow: {
        color: COLORS.textPrimary,
        fontSize: 20,
        marginLeft: SPACING.sm,
    },
});