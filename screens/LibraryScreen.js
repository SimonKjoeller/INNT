import React from 'react';
import { View, SafeAreaView } from 'react-native';
import LibraryTabs from '../components/LibraryTabs';
import { useAuth } from '../components/Auth';

const LibraryScreen = ({ navigation }) => {
  const { user } = useAuth();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LibraryTabs navigation={navigation} userId={user?.uid} />
    </SafeAreaView>
  );
};

export default LibraryScreen;
