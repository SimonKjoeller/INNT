import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#232325',
    borderRadius: 10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    paddingVertical: 4,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,

  },
  searchInput: {
    backgroundColor: '#3a3a3c',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#4a4a4c',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  browseSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  browseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  browseOption: {
    backgroundColor: '#2d2d30',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4a4a4c',
  },
  browseText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
  },
});

export default styles;
