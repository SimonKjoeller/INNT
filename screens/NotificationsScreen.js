import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { ref, onValue, off, update, get, query, orderByChild, equalTo, set } from 'firebase/database';
import { db } from '../database/firebase';
import { useAuth } from '../components/Auth';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [lastOpenPrev, setLastOpenPrev] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setItems([]);
      return;
    }
    // Load previous last open timestamp and immediately update to now
    const metaRef = ref(db, `users/${user.uid}/notificationsMeta/lastOpenedAt`);
    (async () => {
      try {
        const snap = await get(metaRef);
        const prev = snap.exists() ? (snap.val() || 0) : 0;
        setLastOpenPrev(prev || 0);
      } finally {
        try { await set(metaRef, Date.now()); } catch {}
      }
    })();
    const listRef = ref(db, `notifications/${user.uid}`);
    const handler = (snap) => {
      if (!snap.exists()) {
        setItems([]);
        return;
      }
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([key, v]) => ({ id: key, ...v }));
      arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setItems(arr);
    };
    onValue(listRef, handler);
    return () => off(listRef, 'value', handler);
  }, [user?.uid]);

  const markRead = async (id) => {
    if (!user?.uid || !id) return;
    try { await update(ref(db, `notifications/${user.uid}/${id}`), { read: true, readAt: Date.now() }); } catch {}
  };

  const resolveGameKey = async (item) => {
    if (item?.gameKey) return String(item.gameKey);
    if (!item?.gameId) return null;
    try {
      const q = query(ref(db, 'games'), orderByChild('id'), equalTo(item.gameId));
      const snap = await get(q);
      if (snap.exists()) {
        const first = Object.keys(snap.val() || {})[0];
        return first || null;
      }
    } catch {}
    return null;
  };

  const onPressItem = async (item) => {
    await markRead(item.id);
    // Optional deep-links
    if (item.type === 'follow' && item.fromUid) {
      navigation.navigate('SearchedProfile', { viewedUser: { id: item.fromUid } });
    } else if (item.type === 'rating' && item.gameId) {
      const key = await resolveGameKey(item);
      if (key) {
        navigation.navigate('RateGame', { gameId: String(key), fromScreen: 'Notifications' });
      } else {
        // Fallback: open RateGame by internal id if stored as firebase key (may 404 if not matching)
        navigation.navigate('RateGame', { gameId: String(item.gameKey || item.gameId), fromScreen: 'Notifications' });
      }
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => onPressItem(item)}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: item.read ? 'transparent' : '#232433',
        borderBottomWidth: 1,
        borderBottomColor: '#2e3042',
      }}
    >
      {(() => {
        const isRating = item.type === 'rating';
        const isNewSinceOpen = (item.createdAt || 0) > (lastOpenPrev || 0);
        const iconName = isRating ? 'star' : 'person-add';
        const iconColor = isNewSinceOpen ? '#FFD700' : '#9aa0a6';
        return (
          <Icon
            name={iconName}
            size={20}
            color={iconColor}
            style={{ marginRight: 12 }}
          />
        );
      })()}
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: item.read ? '400' : '600' }}>
          {item.title || (item.type === 'follow' ? 'New follower' : 'New rating')}
        </Text>
        <Text style={{ color: '#cfd2dc', fontSize: 12 }} numberOfLines={2}>
          {item.body || ''}
        </Text>
      </View>
      {!item.read && (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4caf50', marginLeft: 8 }} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
      {items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#cfd2dc' }}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}
