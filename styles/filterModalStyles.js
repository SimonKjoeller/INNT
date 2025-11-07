import { StyleSheet } from 'react-native';

const filterModalStyles = StyleSheet.create({
  dropdownMenu: {
    width: '100%',
    backgroundColor: '#222',
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'left',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 0,
    marginBottom: 10,
    position: 'relative',
    height: 40,
  },
  cancelText: {
    color: '#cccccc',
    fontSize: 19,
  },
  filtersText: {
    fontSize: 19,
    color: '#fff',
    fontWeight: 'bold',
  },
  doneText: {
    color: '#6C5CE7',
    fontWeight: 'bold',
    fontSize: 19,
  },
  doneButton: {
    paddingVertical: 0,
    paddingHorizontal: 16,
  },
  doneButtonText: {
    color: '#6C5CE7',
    fontWeight: 'bold',
    fontSize: 16
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#2d2d30',
    paddingTop: 15, // height of navigation header
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#2d2d30', // match navigationStyles.tabBarStyle.backgroundColor
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
  },
  button: {
    width: '90%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#444',
    marginBottom: 12,
    alignItems: 'center',
    marginLeft: 30,
    marginRight: 30,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  closeButton: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
    width: '100%',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default filterModalStyles;
