import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from '../styles/searchScreenStyles';

const SearchScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for games..."
          placeholderTextColor="#8E8E93"
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
      </View>
      
      <View style={styles.browseSection}>
        <Text style={styles.browseTitle}>Browse by</Text>
        
        <TouchableOpacity 
          style={styles.browseOption}
          onPress={() => navigation.navigate('Trending')}
        >
          <Text style={styles.browseText}>Trending Games</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.browseOption}
          onPress={() => navigation.navigate('Upcoming')}
        >
          <Text style={styles.browseText}>Upcoming Games</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>Type in the search bar above</Text>
      </View>
    </View>
  );
};

export default SearchScreen;
