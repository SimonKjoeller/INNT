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
  // Ny: søge-mode: "games" eller "profiles"
  const [searchMode, setSearchMode] = useState('games');

  // NOTE:
  // - For games: hver spil-post bør have name_lower og rules skal indeholde ".indexOn": ["name_lower"].
  // - For profiles: hver user-post bør have username_lower og rules skal indeholde ".indexOn": ["username_lower"].
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
      // Bestem node + indeksfelt baseret på selected mode
      const node = searchMode === 'profiles' ? 'users' : 'games';
      const orderField = searchMode === 'profiles' ? 'username_lower' : 'name_lower';
      console.log(`[GameSearchBar] fetchSuggestions - mode: ${searchMode} node: ${node} prefix:`, lowerPrefix);

      // Prøv indexed prefix-query (forudsætter name_lower/username_lower + index i rules)
      const nodeRef = ref(db, node);
      const q = query(
        nodeRef,
        orderByChild(orderField),
        startAt(lowerPrefix),
        endAt(lowerPrefix + '\uf8ff'),
        limitToFirst(5)
      );

      const snapshot = await get(q);
      let childCount = 0;
      if (snapshot.exists()) snapshot.forEach(() => childCount += 1);
      console.log(`[GameSearchBar] fetchSuggestions - snapshot.exists(): ${snapshot.exists()} children: ${childCount}`);

      const results = [];
      if (snapshot.exists() && childCount > 0) {
        snapshot.forEach(child => {
          const gd = child.val() || {};
          if (searchMode === 'profiles') {
            // expected user object: username/displayName
            results.push({
              firebaseKey: child.key,
              id: gd?.uid || child.key,
              name: gd?.username || gd?.displayName || ''
            });
          } else {
            // games
            results.push({
              firebaseKey: child.key,
              id: gd?.id || child.key,
              name: gd?.name || ''
            });
          }
        });
      } else {
        // Hvis indexed query ikke returnerer noget (fx fordi lower-field mangler på poster),
        // så returner tom liste — du kan genbruge fallback-strategi fra tidligere hvis ønsket.
        console.log('[GameSearchBar] fetchSuggestions - indexed query gav ingen resultater for node:', node);
      }

      setSuggestions(results);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (item) => {
    setSearchText(item.name);
    setSuggestions([]);
    if (searchMode === 'profiles') {
      // Navigate to SearchedProfileScreen with user data
      navigation.navigate('SearchedProfileScreen', { user: item });
    } else {
      navigation.navigate('RateGame', { gameId: item.firebaseKey, fromScreen: 'Search' });
    }
  };

  const handleBlur = () => {
    // Clear search text når tastaturet lukkes
    setSearchText('');
    setSuggestions([]);
  };

  return (
    <View style={styles.searchContainer}>
      {/* Mode toggle */}
      <View style={styles.modeToggleContainer}>
        <TouchableOpacity
          onPress={() => setSearchMode('games')}
          style={[
            styles.modeButton,
            { marginRight: 8 },
            searchMode === 'games' && styles.modeButtonActive
          ]}
        >
          <Text style={searchMode === 'games' ? styles.modeButtonTextActive : styles.modeButtonText}>Games</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSearchMode('profiles')}
          style={[styles.modeButton, searchMode === 'profiles' && styles.modeButtonActive]}
        >
          <Text style={searchMode === 'profiles' ? styles.modeButtonTextActive : styles.modeButtonText}>Profiles</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder={"Search for games..."}
        placeholderTextColor="#8E8E93"
        value={searchText}
        onChangeText={setSearchText}
        onBlur={handleBlur}
        returnKeyType="search"
        editable={true}
      />
      {/* Loading indicator */}
      {loading && (
        <Text style={styles.loadingText}>Searching...</Text>
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
