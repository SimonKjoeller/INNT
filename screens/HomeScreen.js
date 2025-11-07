import React from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native';
import PopularGames from '../components/PopularGames';
import TrendingGames from '../components/TrendingGames';
import GenreGamesRow from '../components/GenreGamesRow';

const HomeScreen = ({ navigation }) => {
  return (
  <ScrollView style={homeScreenStyles.container} showsVerticalScrollIndicator={false}>
      <PopularGames navigation={navigation} />
      <TrendingGames navigation={navigation} /> 
      <GenreGamesRow navigation={navigation} genreName="Shooter" />
      <GenreGamesRow navigation={navigation} genreName="Racing" />
      <GenreGamesRow navigation={navigation} genreName="Adventure" />
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
};

export default HomeScreen;
