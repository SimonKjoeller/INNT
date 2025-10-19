import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '../database/firebase';
import styles from '../styles/searchScreenStyles';

const GameSearchBar = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [allGames, setAllGames] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (searchText.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const filtered = allGames.filter(game =>
      game.name.toLowerCase().includes(searchText.toLowerCase())
    ).slice(0, 5);
    setSuggestions(filtered);
  }, [searchText, allGames]);

  const fetchGames = async () => {
    try {
      const gamesRef = ref(db, 'games');
      const snapshot = await get(gamesRef);
      if (snapshot.exists()) {
        const gamesData = snapshot.val();
        const gamesArray = Object.keys(gamesData).map(key => ({
          firebaseKey: key,
          id: gamesData[key]?.id || key,
          name: gamesData[key]?.name || '',
        }));
        setAllGames(gamesArray);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (game) => {
    setSearchText(game.name);
    setSuggestions([]);
    navigation.navigate('RateGame', { gameId: game.firebaseKey, fromScreen: 'Search' });
  };

  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder={"Search for games..."}
        placeholderTextColor="#8E8E93"
        value={searchText}
        onChangeText={setSearchText}
        returnKeyType="search"
        editable={!loading}
      />
      {/* Loading indicator */}
      {loading && (
        <Text style={{ color: '#aaa', marginTop: 8, marginLeft: 4 }}>Fetching games...</Text>
      )}
      {/* Suggestions dropdown */}
      {!loading && searchText.length > 0 && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(game)}
            >
              <Text style={styles.suggestionText}>{game.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default GameSearchBar;
