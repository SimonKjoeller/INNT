
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles/styles';
import searchedProfileScreenStyles from '../styles/searchedProfileScreenStyles';
import { db } from '../database/firebase';
import { ref, set, get } from 'firebase/database';
import { useAuth } from '../components/Auth';

// Helper to get initials for avatar fallback
function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function SearchedProfileScreen({ route }) {
  const navigation = useNavigation();
  // Support both 'user' and 'viewedUser' for compatibility
  const { user: navUser, viewedUser: navViewedUser } = route.params || {};
  const viewedUser = navUser || navViewedUser || {};
  const { user: currentUser } = useAuth();
  // Fallbacks for display
  const username = viewedUser?.username || viewedUser?.name || viewedUser?.displayName || 'Unknown';
  const email = viewedUser?.email || '';

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Check if already following
  useEffect(() => {
    if (!currentUser?.uid || !viewedUser?.id) return;
    const followRef = ref(db, `following/${currentUser.uid}/${viewedUser.id}`);
    get(followRef).then(snap => {
      setIsFollowing(!!snap.exists());
    });
  }, [currentUser?.uid, viewedUser?.id]);

  // Follow handler
  const handleFollow = async () => {
    if (!currentUser?.uid || !viewedUser?.id) return;
    setFollowLoading(true);
    try {
      // Write to /following/{currentUserId}/{viewedUserId}: true
      await set(ref(db, `following/${currentUser.uid}/${viewedUser.id}`), true);
      // Write to /followers/{viewedUserId}/{currentUserId}: true
      await set(ref(db, `followers/${viewedUser.id}/${currentUser.uid}`), true);
      setIsFollowing(true);
    } catch (e) {
      // Optionally show error
    } finally {
      setFollowLoading(false);
    }
  };

  // Stats: try to get from user object, fallback to 0
  const ratingsCount = viewedUser?.ratingsCount ?? viewedUser?.ratings_count ?? 0;
  const playedCount = viewedUser?.playedCount ?? viewedUser?.played_count ?? 0;
  const wishlistCount = viewedUser?.wishlistCount ?? viewedUser?.wishlist_count ?? 0;

  // Level & XP calculation (same as ProfileScreen)
  const derivedXP = useMemo(() => (ratingsCount * 50) + (playedCount * 18) + (wishlistCount * 15), [ratingsCount, playedCount, wishlistCount]);
  const baseLevel = viewedUser?.stats?.level || 0;
  const level = Math.max(0, baseLevel + Math.floor(derivedXP / 200));
  const currentLevelStartXP = Math.floor(derivedXP / 200) * 200;
  const xpIntoLevel = derivedXP - currentLevelStartXP;
  const levelGoal = 200;
  const progressPct = Math.max(0, Math.min(1, xpIntoLevel / levelGoal));

  // Stat cards config (interactive)
  const stats = [
    { key: 'rated', label: 'Ratings', value: ratingsCount, icon: 'star' },
    { key: 'played', label: 'Played', value: playedCount, icon: 'game-controller' },
    { key: 'wishlist', label: 'Wishlist', value: wishlistCount, icon: 'bookmark' },
  ];

  // Handler for stat card press
  const handlePressStat = (tabKey) => {
    // Navigate to Library tab, passing userId and initialTab
    navigation.navigate('Library', {
      screen: 'LibraryMain',
      params: { initialTab: tabKey, userId: viewedUser?.id || viewedUser?.uid || viewedUser?.firebaseKey },
    });
  };

  return (
    <View style={styles.profileContainer}>
      <ScrollView style={styles.profileScroll} contentContainerStyle={[styles.profileScrollContent, { paddingBottom: 32 }]}> 
        {/* Purple gradient header with avatar, name, level, xp */}
        <LinearGradient
          colors={["#4a42e4", "#8a2be2", "#1e1f2b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarRing}>
              {viewedUser?.avatarUrl ? (
                <Image source={{ uri: viewedUser.avatarUrl }} style={styles.avatar} resizeMode="cover" />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{getInitials(username)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.gamerTag}>{username}</Text>
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
          </View>
        </LinearGradient>

        {/* Follow and Message buttons */}
        <View style={searchedProfileScreenStyles.followMessageButtonRow}>
          <TouchableOpacity
            style={[styles.actionButton, searchedProfileScreenStyles.followMessageButton, isFollowing && { backgroundColor: '#303341' }]}
            activeOpacity={0.85}
            onPress={handleFollow}
            disabled={isFollowing || followLoading}
          >
            <Text style={styles.actionButtonText}>{isFollowing ? 'Following' : (followLoading ? 'Following...' : 'Follow')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary, searchedProfileScreenStyles.followMessageButton]} activeOpacity={0.85}>
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Stat row (interactive) */}
        <View style={styles.statRow}>
          {stats.map((s) => (
            <TouchableOpacity
              key={s.key}
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

      </ScrollView>
    </View>
  );
}
