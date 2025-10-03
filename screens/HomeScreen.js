import React from 'react';
import { View } from 'react-native';
import PopularGames from '../components/PopularGames';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={homeScreenStyles.container}>
      <PopularGames navigation={navigation} />
      {/* Her kan du tilføje flere kategorier senere */}
      {/* <TrendingGames navigation={navigation} /> */}
      {/* <RecentGames navigation={navigation} /> */}
    </View>
  );
};

const homeScreenStyles = {
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
};

export default HomeScreen;
