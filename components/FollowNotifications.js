import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ref, get, onChildAdded } from 'firebase/database';
import { db } from '../database/firebase';
import { useAuth } from './Auth';

// Ensure alerts are shown while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function FollowNotifications() {
  const { user } = useAuth();
  const initializedRef = useRef(false);
  const existingKeysRef = useRef(new Set());
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    // Request permissions for local notifications (iOS requires this)
    (async () => {
      const { status: current } = await Notifications.getPermissionsAsync();
      if (current !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
      // Configure Android notification channel for visibility
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default',
          });
        } catch {}
      }
    })();
  }, []);

  useEffect(() => {
    // Cleanup previous listener if user changes
    if (unsubscribeRef.current) {
      try { unsubscribeRef.current(); } catch {}
      unsubscribeRef.current = null;
    }
    initializedRef.current = false;
    existingKeysRef.current = new Set();

    if (!user?.uid) return;

    const followersRef = ref(db, `followers/${user.uid}`);

    // Step 1: snapshot existing follower keys so we don't notify for old entries
    get(followersRef).then((snap) => {
      const existing = new Set();
      if (snap.exists()) {
        const val = snap.val();
        Object.keys(val || {}).forEach((k) => existing.add(k));
      }
      existingKeysRef.current = existing;
      initializedRef.current = true;

      // Step 2: listen for new followers only (child_added after init)
      const unsubscribe = onChildAdded(followersRef, async (childSnap) => {
        // Debug log to verify listener firing
        // console.log('onChildAdded followers: ', childSnap.key);
        if (!initializedRef.current) return; // safety
        const followerUid = childSnap.key;
        if (existingKeysRef.current.has(followerUid)) {
          // Seen at init; ignore
          return;
        }
        // Resolve follower's display name
        let followerName = 'Someone';
        try {
          const u = await get(ref(db, `users/${followerUid}`));
          if (u.exists()) {
            const uv = u.val();
            followerName = uv?.username || uv?.displayName || followerUid;
          }
        } catch {}

        // Show an immediate local notification (foreground-only usage)
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'New follower',
              body: `${followerName} started following you`,
              sound: 'default',
              data: { type: 'follow', fromUid: followerUid },
            },
            trigger: null,
          });
        } catch (e) {
          // console.warn('Failed to schedule local notification', e);
        }
      });

      unsubscribeRef.current = unsubscribe;
    });

    return () => {
      if (unsubscribeRef.current) {
        try { unsubscribeRef.current(); } catch {}
        unsubscribeRef.current = null;
      }
    };
  }, [user?.uid]);

  return null;
}
