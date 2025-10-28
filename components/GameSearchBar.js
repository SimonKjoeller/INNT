import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { ref, get, query, orderByChild, startAt, endAt, limitToFirst } from 'firebase/database';
import { db } from '../database/firebase';
import styles from '../styles/searchScreenStyles';

const GameSearchBar = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // NOTE: For denne prefix-forespørgsel skal hvert spil have et felt 'name_lower' (lowercased name)
  // og Realtime DB rules skal indeholde ".indexOn": ["name_lower"] under /games.
  // Alternativt kan du tilføje name_lower ved import/oprettelse af spil.

  useEffect(() => {
    // Debounce for at reducere antal queries ved hurtig indtastning
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchText.trim().length === 0) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(searchText.trim().toLowerCase());
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  // Prefix-søgning: orderByChild('name_lower') + startAt/endAt + limitToFirst
  const fetchSuggestions = async (lowerPrefix) => {
    try {
      setLoading(true);
      const gamesRef = ref(db, 'games');

      // Debug: log hvad vi søger efter
      console.log('[GameSearchBar] fetchSuggestions - prefix:', lowerPrefix);

      // Søger efter alle name_lower der starter med prefix (venligst sørg for name_lower findes i DB)
      const q = query(
        gamesRef,
        orderByChild('name_lower'),
        startAt(lowerPrefix),
        endAt(lowerPrefix + '\uf8ff'),
        limitToFirst(5)
      );

      const snapshot = await get(q);
      // Debug: log om snapshot eksisterer og antal children
      let childCount = 0;
      if (snapshot.exists()) {
        snapshot.forEach(() => { childCount += 1; });
      }
      console.log('[GameSearchBar] fetchSuggestions - snapshot.exists():', snapshot.exists(), 'children:', childCount);

      const results = [];
      if (snapshot.exists()) {
        snapshot.forEach(child => {
          const gd = child.val();
          results.push({
            firebaseKey: child.key,
            id: gd?.id || child.key,
            name: gd?.name || ''
          });
        });
      }

      setSuggestions(results);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
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
        editable={true}
      />
      {/* Loading indicator */}
      {loading && (
        <Text style={{ color: '#aaa', marginTop: 8, marginLeft: 4 }}>Searching...</Text>
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
