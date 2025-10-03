import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import PopularGames from '../components/PopularGames';
import styles from '../styles/screenStyles';

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={homeScreenStyles.container}>
      <View style={homeScreenStyles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={homeScreenStyles.subtitle}>Find your next favorite game</Text>
      </View>
      
      <PopularGames navigation={navigation} />
      
      {/* Her kan du tilføje flere kategorier senere */}
      {/* <TrendingGames navigation={navigation} /> */}
      {/* <RecentGames navigation={navigation} /> */}
    </ScrollView>
  );
};

const homeScreenStyles = {
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 5,
  },
};

export default HomeScreen;
