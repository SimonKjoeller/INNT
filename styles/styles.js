import { StyleSheet } from 'react-native'; // StyleSheet API til performance optimeret styles

export const styles = StyleSheet.create({
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
    marginTop: 8,
    backgroundColor: '#dd3b3b',
  },


  // Scroll container (selve viewport) for profilskærm
  profileScroll: {
    flex: 1,
    backgroundColor: '#181A20'
  },


  // Indhold styling inde i scroll view
  profileScrollContent: {
    padding: 24
  }
});