import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { ref, onChildAdded, update } from 'firebase/database';
import { db } from '../database/firebase';
import { useAuth } from './Auth';

export default function RatingNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;
    const listRef = ref(db, `notifications/${user.uid}`);

    const unsub = onChildAdded(listRef, async (snap) => {
      const val = snap.val();
      if (!val || val.type !== 'rating' || val.delivered) return;
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: val.title || 'New rating',
            body: val.body || 'Someone you follow rated a game',
            data: {
              type: 'rating',
              fromUid: val.fromUid,
              gameId: val.gameId,
            },
            sound: 'default',
          },
          trigger: null,
        });
      } finally {
        await update(snap.ref, { delivered: true, deliveredAt: Date.now() });
      }
    });

    return () => { try { unsub && unsub(); } catch {} };
  }, [user?.uid]);

  return null;
}
