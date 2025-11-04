import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import styles from '../styles/searchScreenStyles';
import GameSearchBar from '../components/GameSearchBar';


const SearchScreen = ({ navigation }) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <GameSearchBar navigation={navigation} />

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
    </TouchableWithoutFeedback>
  );
};

export default SearchScreen;
