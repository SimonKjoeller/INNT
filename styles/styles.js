import { StyleSheet } from 'react-native'; // StyleSheet API til performance optimeret styles

export const styles = StyleSheet.create({
  // Error text for forms
  errorText: {
    color: '#ff6b6b',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  // --- GENEREL LAYOUT ---
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 64,
    backgroundColor: '#181A20', // mørk baggrund
    justifyContent: 'center', // centrer vertikalt (login/signup formular)
  },
  // Titel typografi
  title: { 
    fontSize: 32, 
    
    fontWeight: '700', 
    marginBottom: 32, 
    color: '#6756fcff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  paragraph: { 
    fontSize: 16, 
    marginBottom: 12, 
    color: '#ccc',
    textAlign: 'center',
  },
  // Input felter (fælles reuse)
  input: {
    backgroundColor: '#44424eff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#f1ededff',
    borderWidth: 0,
    
  },
  // Link tekst under formularer
  linkText: {
    marginTop: 24,
    textAlign: 'center',
    textDecorationLine: 'underline',
    color: '#fdfdfdff',
    fontSize: 15,
    opacity: 0.85,
  },


  // Footer fast i bunden
  footer: {
    position: 'absolute',
    bottom: 15, // hævet lidt fra bunden
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: '#23262F',
    paddingVertical: 10,
    backgroundColor: '#181A20',
  },
  footerFlatContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', // Fordeler venstre / midt / højre
    width: '100%',
  },
  footerFlatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  footerFlatIcon: {
    color: '#7d838a',
    marginRight: 6,
  },
  footerFlatText: {
    fontSize: 12,
    color: '#aeb3b8',
    letterSpacing: 0.4,
  },


  // Wrapper til knap så Button kan få afrundede hjørner (overflow hidden)
  buttonWrapper: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 2,
    paddingHorizontal: 2,
    backgroundColor: '#4a42e4ff',
    marginBottom: 8
  },
  linkTouchable: {
    marginTop: 24,
  },

  
  // --- PROFIL SPECIFIKKE STYLES ---
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 12,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#24262f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarFallbackText: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 16,
    color: '#d1d1d1',
    marginTop: 4,
  },

  // Gamer header
  headerGradient: {
    borderRadius: 16,
    paddingVertical: 0,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  gamerTag: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  avatarRing: {
    borderWidth: 2,
    borderColor: '#6756fcff',
    borderRadius: 26,
    padding: 3,
    marginBottom: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  levelBadgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  levelXPText: {
    color: '#e0e0e0',
    fontSize: 12,
  },
  progressBar: {
    width: '85%',
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00e0ff',
  },


  // Række med statistik kort
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },


  // Individuelt statistik kort
  statCard: {
    flex: 1,
    backgroundColor: '#22252d',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#8a8f98',
  },


  // Række af handlingsknapper
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 40,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4a42e4ff',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: '#303341',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#ffffff',
  },
  logoutButton: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 24,
    backgroundColor: '#8b0000',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },


  // Scroll container (selve viewport) for profilskærm
  profileScroll: {
    flex: 1,
    backgroundColor: '#181A20'
  },


  // Indhold styling inde i scroll view
  profileScrollContent: {
    padding: 24
  },

  // Profile screen container and spacer
  profileContainer: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  footerSpacer: {
    height: 40,
  },

  // Badges styles
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  badgesHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    justifyContent: 'center',
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#2a2d39',
  },
  badgeText: {
    color: '#e7e7e7',
    fontSize: 12,
    fontWeight: '600',
  },
  badgesHint: {
    color: '#9aa0a6',
    fontSize: 12,
  },

  // Level up overlay
  levelUpOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelUpCard: {
    width: '78%',
    backgroundColor: '#22252d',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  levelUpIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  levelUpTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  levelUpSubtitle: {
    fontSize: 14,
    color: '#d9d9d9',
  },
  levelUpCloseText: {
    color: '#9aa0a6',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});