
import React, { useState, useLayoutEffect } from 'react';
import navigationStyles from '../styles/navigationStyles';
import FullPopularGames from '../components/FullPopularGames';
import FilterModal from '../components/FilterModal';

const PopularScreen = ({ navigation }) => {
  const [filterVisible, setFilterVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
          <Icon name="options-outline" size={26} color={navigationStyles.headerTintColor} style={{ marginRight: 16 }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <>
      <FullPopularGames navigation={navigation} />
      <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
    </>
  );
};

import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default PopularScreen;
