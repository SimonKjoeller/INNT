import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import styles from '../styles/searchScreenStyles';

const SearchScreen = () => {
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
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Search Screen</Text>
        <Text style={styles.subtitle}>Type in the search bar above</Text>
      </View>
    </View>
  );
};

export default SearchScreen;
