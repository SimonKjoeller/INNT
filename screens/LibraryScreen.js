import React from 'react';
import { View } from 'react-native';
import LibraryTabs from '../components/LibraryTabs';
import { useAuth } from '../components/Auth';

const LibraryScreen = ({ navigation }) => {
  const { user } = useAuth();
  return (
    <View style={{ flex: 1 }}>
      <LibraryTabs navigation={navigation} userId={user?.uid} />
    </View>
  );
};

export default LibraryScreen;
