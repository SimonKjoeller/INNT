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
            onPress={() => navigation.navigate('Popular')}
          >
            <Text style={styles.browseText}>Popular Games</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.browseOption}
            onPress={() => navigation.navigate('Popular')}
          >
            <Text style={styles.browseText}>Popular Games</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.browseOption}
            onPress={() => navigation.navigate('BrowseBy', { mode: 'trending', limit: 24 })}
          >
            <Text style={styles.browseText}>Trending Games</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.browseOption}
            onPress={() => navigation.navigate('BrowseBy', { mode: 'upcoming', limit: 24 })}
          >
            <Text style={styles.browseText}>Upcoming Games</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.browseOption}
            onPress={() => navigation.navigate('BrowseBy', { mode: 'genre', genreName: 'Shooter' })}
          >
            <Text style={styles.browseText}>Shooter</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.browseOption}
            onPress={() => navigation.navigate('BrowseBy', { mode: 'genre', genreName: 'Racing' })}
          >
            <Text style={styles.browseText}>Racing</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.browseOption}
            onPress={() => navigation.navigate('BrowseBy', { mode: 'genre', genreName: 'Adventure' })}
          >
            <Text style={styles.browseText}>Adventure</Text>
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
