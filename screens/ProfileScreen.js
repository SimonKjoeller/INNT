import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../components/Auth';
import { styles } from '../styles/styles';
import { db } from '../database/firebase';
import { ref, query, orderByChild, equalTo, onValue, off } from 'firebase/database';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

// Removed static logo in favor of dynamic user avatar

export default function ProfileScreen() {
  const { user, profile, logout, username } = useAuth(); // Henter user, logout + brugernavn fra context
  const displayName = username || 'Unknown user';
  const navigation = useNavigation();
  const avatarUri = profile?.photoURL || user?.photoURL || null; // Prefer RTDB photoURL, fallback to Auth

  const [ratingsCount, setRatingsCount] = useState(0);
  const [playedCount, setPlayedCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Realtime lyttere: opdater counts så snart data ændres
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
    const followersRef = ref(db, `followers/${uid}`);
    const followingRef = ref(db, `following/${uid}`);
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
    const handleFollowers = (snap) => {
      const val = snap.exists() ? snap.val() : null;
      setFollowersCount(val ? Object.keys(val).length : 0);
    };
    const handleFollowing = (snap) => {
      const val = snap.exists() ? snap.val() : null;
      setFollowingCount(val ? Object.keys(val).length : 0);
    };

    onValue(wishlistRef, handleWishlist);
    onValue(playedRef, handlePlayed);
    onValue(ratingsQuery, handleRatings);
    onValue(followersRef, handleFollowers);
    onValue(followingRef, handleFollowing);

    return () => {
      off(wishlistRef, 'value', handleWishlist);
      off(playedRef, 'value', handlePlayed);
      off(ratingsQuery, 'value', handleRatings);
      off(followersRef, 'value', handleFollowers);
      off(followingRef, 'value', handleFollowing);
    };
  }, [user?.uid]);

  // Level & XP (simple derived model for gamification)
  const derivedXP = useMemo(() => (ratingsCount * 50) + (playedCount * 18) + (wishlistCount * 15), [ratingsCount, playedCount, wishlistCount]);
  const baseLevel = profile?.stats?.level || 0;
  const level = Math.max(0, baseLevel + Math.floor(derivedXP / 200));
  const currentLevelStartXP = Math.floor(derivedXP / 200) * 200;
  const xpIntoLevel = derivedXP - currentLevelStartXP;
  const levelGoal = 200;
  const progressPct = Math.max(0, Math.min(1, xpIntoLevel / levelGoal));


  // Dynamiske stats + ikoner
  const stats = [
    { key: 'rated', label: 'Ratings', value: ratingsCount, icon: 'star' },
    { key: 'played', label: 'Played', value: playedCount, icon: 'game-controller' },
    { key: 'wishlist', label: 'Wishlist', value: wishlistCount, icon: 'bookmark' },
  ];

  // Achievement badges
  const badges = useMemo(() => {
    const b = [];
    if (ratingsCount >= 50) b.push('Rater III');
    else if (ratingsCount >= 25) b.push('Rater II');
    else if (ratingsCount >= 10) b.push('Rater I');
    if (playedCount >= 50) b.push('Finisher');
    else if (playedCount >= 25) b.push('Gamer II');
    else if (playedCount >= 10) b.push('Gamer I');
    else if (playedCount >= 1) b.push('Gamer Newbie');
    if (wishlistCount >= 50) b.push('Collector');
    if (ratingsCount >= 1 && playedCount >= 1) b.push('All-Rounder');
    return b;
  }, [ratingsCount, playedCount, wishlistCount]);

  const handlePressStat = (tabKey) => {
    // Navigerer til Library-tabben og åbn den ønskede undermenu
    Haptics.selectionAsync();
    navigation.navigate('Library', {
      screen: 'LibraryMain',
      params: { initialTab: tabKey },
    });
  };

  return (
    <View style={styles.profileContainer}>
       {/* ScrollView så siden kan udvides med mere indhold uden overflow */}
      <ScrollView style={styles.profileScroll} contentContainerStyle={styles.profileScrollContent}>
        {/* Gamer-styled header with gradient, avatar ring and level */}
        <LinearGradient
          colors={["#4a42e4", "#8a2be2", "#1e1f2b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarRing}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{(displayName || 'U').slice(0,1).toUpperCase()}</Text>
                </View>
              )}
            </View>
            <Text style={styles.gamerTag}>{displayName}</Text>
            <View style={styles.levelRow}>
              <View style={styles.levelBadge}>
                <Icon name="flame" size={14} color="#fff" />
                <Text style={styles.levelBadgeText}>Lvl {level}</Text>
              </View>
              <Text style={styles.levelXPText}>{xpIntoLevel}/{levelGoal} XP</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.round(progressPct * 100)}%` }]} />
            </View>
            {/* Badges inside header */}
            <View style={styles.badgesHeader}>
              {badges.length > 0 ? (
                badges.map((b) => (
                  <View key={b} style={styles.badgeChip}>
                    <Icon name="trophy" size={14} color="#ffd369" />
                    <Text style={styles.badgeText}>{b}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.badgesHint}>Earn badges by rating, playing and building your wishlist.</Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Followers / Following row (not clickable) */}
        <View style={[styles.statRow, { gap: 8, marginBottom: 16 }]}>
          <View style={styles.smallStatCard}>
            <Icon name="people" size={16} color="#959688ff" style={styles.statIcon} />
            <Text style={styles.smallStatValue}>{followersCount}</Text>
            <Text style={styles.smallStatLabel}>Followers</Text>
          </View>
          <View style={styles.smallStatCard}>
            <Icon name="person-add" size={16} color="#959688ff" style={styles.statIcon} />
            <Text style={styles.smallStatValue}>{followingCount}</Text>
            <Text style={styles.smallStatLabel}>Following</Text>
          </View>
        </View>

        {/* Statistik kort i en Listerække */}    
        <View style={styles.statRow}>
          {stats.map((s) => (
            <TouchableOpacity
              key={s.label}
              style={styles.statCard}
              activeOpacity={0.8}
              onPress={() => handlePressStat(s.key)}
            >
              <Icon name={s.icon} size={18} color="#959688ff" style={styles.statIcon} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        
        
        {/* Handlingsknapper til fremtidige features */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.85}>
            <Text style={styles.actionButtonText}>Rate Game</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Logout knap */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={logout}>
          <Text style={styles.actionButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Ekstra afstand så indhold ikke skjules bag footer */}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
}
