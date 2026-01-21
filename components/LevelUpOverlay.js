// UseMemo sørger 
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useAuth } from './Auth';
import { db } from '../database/firebase';
import { ref, query, orderByChild, equalTo, onValue, off } from 'firebase/database';
import { styles } from '../styles/styles';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function LevelUpOverlay() {
  const { user } = useAuth();
  const [ratingsCount, setRatingsCount] = useState(0);
  const [playedCount, setPlayedCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Listen to user stats globally
  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setRatingsCount(0);
      setPlayedCount(0);
      setWishlistCount(0);
      return;
    }
    const wishlistRef = ref(db, `users/${uid}/wishlist`);
    const playedRef = ref(db, `users/${uid}/played`);
    const ratingsRef = ref(db, 'userRatings');
    const ratingsQuery = query(ratingsRef, orderByChild('user_id'), equalTo(uid));

    const handleWishlist = (snap) => {
      const val = snap.exists() ? snap.val() : null;
      setWishlistCount(val ? Object.keys(val).length : 0);
    };
    const handlePlayed = (snap) => {
      const val = snap.exists() ? snap.val() : null;
      setPlayedCount(val ? Object.keys(val).length : 0);
    };
    const handleRatings = (snap) => {
      const val = snap.exists() ? snap.val() : null;
      setRatingsCount(val ? Object.keys(val).length : 0);
    };

    onValue(wishlistRef, handleWishlist);
    onValue(playedRef, handlePlayed);
    onValue(ratingsQuery, handleRatings);

    return () => {
      off(wishlistRef, 'value', handleWishlist);
      off(playedRef, 'value', handlePlayed);
      off(ratingsQuery, 'value', handleRatings);
    };
  }, [user?.uid]);

  // Derived level same as ProfileScreen (keep in sync)
  const derivedXP = useMemo(() => (ratingsCount * 50) + (playedCount * 18) + (wishlistCount * 15), [ratingsCount, playedCount, wishlistCount]);
  const level = Math.max(0, Math.floor(derivedXP / 200));

  // Animation state
  const [show, setShow] = useState(false);
  const prevLevelRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [confettiKey, setConfettiKey] = useState(0);
  const { width } = Dimensions.get('window');

  const close = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 150, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true })
    ]).start(() => setShow(false));
  };

  const trigger = () => {
    setShow(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scaleAnim.setValue(0.85);
    opacityAnim.setValue(0);
    setConfettiKey((k) => k + 1);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();
    setTimeout(() => close(), 4000);
  };

  useEffect(() => {
    if (prevLevelRef.current === null) {
      prevLevelRef.current = level;
      return;
    }
    if (level > prevLevelRef.current) {
      trigger();
    }
    prevLevelRef.current = level;
  }, [level]);

  if (!show) return null;

  return (
    <View style={styles.levelUpOverlay} pointerEvents="auto">
      {/* Confetti blast */}
      <ConfettiCannon
        key={confettiKey}
        count={100}
        fallSpeed={2500}
        origin={{ x: width / 2, y: -10 }}
        autoStart
        fadeOut
      />
      <Animated.View style={[styles.levelUpCard, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <LinearGradient
          colors={["#5a52f0", "#a96bff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.levelUpIconWrap}
        >
          <Icon name="trophy" size={28} color="#fff" />
        </LinearGradient>
        <Text style={styles.levelUpTitle}>Level Up!</Text>
        <Text style={styles.levelUpSubtitle}>You're now Level {level + 1}</Text>
        <TouchableOpacity onPress={close} activeOpacity={0.85} style={{ marginTop: 10 }}>
          <Text style={styles.levelUpCloseText}>Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
