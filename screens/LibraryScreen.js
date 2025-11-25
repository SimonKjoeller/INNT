import React, { useLayoutEffect, useMemo } from 'react';
import { View, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LibraryTabs from '../components/LibraryTabs';
import { useAuth } from '../components/Auth';

const LibraryScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const initialTab = route?.params?.initialTab;
  const routeUserId = route?.params?.userId;
  const viewedUsername = route?.params?.viewedUsername;
  const effectiveUserId = useMemo(() => routeUserId || user?.uid, [routeUserId, user?.uid]);
  const isForeign = !!routeUserId && routeUserId !== user?.uid;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isForeign && viewedUsername ? `${viewedUsername}'s Library` : 'Library',
      headerLeft: isForeign
        ? () => (
            <TouchableOpacity
              onPress={() => navigation.setParams({ userId: undefined, viewedUsername: undefined })}
              activeOpacity={0.7}
              style={{ marginLeft: 12, padding: 6 }}
            >
              <Icon name="arrow-back" size={22} color="#ffffff" />
            </TouchableOpacity>
          )
        : undefined,
    });
  }, [navigation, isForeign, viewedUsername]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
      {isForeign && (
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <TouchableOpacity
            onPress={() => navigation.setParams({ userId: undefined, viewedUsername: undefined })}
            activeOpacity={0.85}
            style={{
              width: '100%',
              alignSelf: 'stretch',
              backgroundColor: '#8b0000',
              borderRadius: 12,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: '#a33',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700', letterSpacing: 0.4 }}>Return to My Library</Text>
          </TouchableOpacity>
        </View>
      )}
      <LibraryTabs navigation={navigation} userId={effectiveUserId} initialTab={initialTab} />
    </SafeAreaView>
  );
};

export default LibraryScreen;
