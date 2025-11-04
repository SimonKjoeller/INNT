import React from 'react';
import { View, SafeAreaView } from 'react-native';
import LibraryTabs from '../components/LibraryTabs';
import { useAuth } from '../components/Auth';

const LibraryScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const initialTab = route?.params?.initialTab;
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LibraryTabs navigation={navigation} userId={user?.uid} initialTab={initialTab} />
    </SafeAreaView>
  );
};

export default LibraryScreen;
