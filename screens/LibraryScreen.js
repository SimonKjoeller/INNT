import React from 'react';
import { View } from 'react-native';
import LibraryTabs from '../components/LibraryTabs';

const LibraryScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <LibraryTabs navigation={navigation} userId="user1" />
    </View>
  );
};

export default LibraryScreen;
