import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { ref, onValue, off, get, update } from 'firebase/database';
import { db } from '../database/firebase';
import { useAuth } from './Auth';

export default function NotificationsBell({ tintColor = '#fff' }) {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setUnread(0);
      return;
    }
    const listRef = ref(db, `notifications/${user.uid}`);
    const handler = (snap) => {
      if (!snap.exists()) {
        setUnread(0);
        return;
      }
      const val = snap.val() || {};
      const count = Object.values(val).reduce((acc, n) => acc + (n && n.read ? 0 : 1), 0);
      setUnread(count);
    };
    onValue(listRef, handler);
    return () => off(listRef, 'value', handler);
  }, [user?.uid]);

  const openNotifications = async () => {
    // Navigate immediately for responsiveness; clear unread in background
    navigation.navigate('Notifications');
    try {
      if (!user?.uid) return;
      const listRef = ref(db, `notifications/${user.uid}`);
      const snap = await get(listRef);
      if (!snap.exists()) return;
      const val = snap.val() || {};
      const updates = [];
      Object.entries(val).forEach(([key, v]) => {
        if (!v?.read) {
          updates.push(update(ref(db, `notifications/${user.uid}/${key}`), { read: true, readAt: Date.now() }));
        }
      });
      if (updates.length) {
        try { await Promise.all(updates); } catch {}
      }
    } catch {}
  };

  return (
    <TouchableOpacity onPress={openNotifications} style={{ paddingHorizontal: 8 }}>
      <View>
        <Icon name={unread > 0 ? 'notifications' : 'notifications-outline'} size={22} color={tintColor} />
        {unread > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: '#ff3b30',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 3,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }} numberOfLines={1}>
              {unread > 9 ? '9+' : String(unread)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
