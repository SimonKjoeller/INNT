
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles/styles';
import searchedProfileScreenStyles from '../styles/searchedProfileScreenStyles';
import { db } from '../database/firebase';
import { ref, set, get, remove, query, orderByChild, equalTo, onValue, off, push } from 'firebase/database';
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

  // Follow/Unfollow toggle handler
  const handleFollow = async () => {
    const targetId = viewedUser?.id || viewedUser?.uid || viewedUser?.firebaseKey;
    if (!currentUser?.uid || !targetId) return;
    setFollowLoading(true);
    try {
      const followingPath = `following/${currentUser.uid}/${targetId}`;
      const followersPath = `followers/${targetId}/${currentUser.uid}`;
      if (isFollowing) {
        // Unfollow: remove both sides
        await Promise.all([
          remove(ref(db, followingPath)),
          remove(ref(db, followersPath)),
        ]);
        setIsFollowing(false);
      } else {
        // Follow: set both sides
        await Promise.all([
          set(ref(db, followingPath), true),
          set(ref(db, followersPath), true),
        ]);
        // Persist follow notification for target so their bell updates (avoid duplicates)
        try {
          const notifRef = ref(db, `notifications/${targetId}`);
          const existingListSnap = await get(notifRef);
            let duplicate = false;
            if (existingListSnap.exists()) {
              const all = existingListSnap.val() || {};
              for (const k of Object.keys(all)) {
                const v = all[k];
                if (v && v.type === 'follow' && v.fromUid === currentUser.uid && !v.read) {
                  duplicate = true;
                  break;
                }
              }
            }
            if (!duplicate) {
              const newRef = push(notifRef);
              const displayName = currentUser.displayName || currentUser.username || currentUser.email || 'Someone';
              await set(newRef, {
                type: 'follow',
                fromUid: currentUser.uid,
                title: 'New follower',
                body: `${displayName} started following you`,
                read: false,
                createdAt: Date.now(),
              });
            }
        } catch (e) {
          // ignore notification write failure
        }
        setIsFollowing(true);
      }
    } catch (e) {
      // Optionally show error
    } finally {
      setFollowLoading(false);
    }
  };

  // Stats: try to get from user object, fallback to 0
  const [dynamicRatings, setDynamicRatings] = useState(null);
  const [dynamicPlayed, setDynamicPlayed] = useState(null);
  const [dynamicWishlist, setDynamicWishlist] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const targetUid = viewedUser?.id || viewedUser?.uid || viewedUser?.firebaseKey || null;

  // Realtime followers/following counts for the viewed user
  useEffect(() => {
    if (!targetUid) {
      setFollowersCount(0);
      setFollowingCount(0);
      return;
    }

    const followersRef = ref(db, `followers/${targetUid}`);
    const followingRef = ref(db, `following/${targetUid}`);

    const handleFollowers = (snap) => {
      const val = snap.exists() ? snap.val() : null;
      setFollowersCount(val ? Object.keys(val).length : 0);
    };
    const handleFollowing = (snap) => {
      const val = snap.exists() ? snap.val() : null;
      setFollowingCount(val ? Object.keys(val).length : 0);
    };

    onValue(followersRef, handleFollowers);
    onValue(followingRef, handleFollowing);

    return () => {
      off(followersRef, 'value', handleFollowers);
      off(followingRef, 'value', handleFollowing);
    };
  }, [targetUid]);

  // Fetch live counts for viewed user (one-shot, foreground only)
  useEffect(() => {
    let cancelled = false;
    const fetchCounts = async () => {
      if (!targetUid) return;
      try {
        // Ratings count via userRatings query
        const ratingsQ = query(ref(db, 'userRatings'), orderByChild('user_id'), equalTo(targetUid));
        const ratingsSnap = await get(ratingsQ);
        if (!cancelled) {
          const rc = ratingsSnap.exists() ? Object.keys(ratingsSnap.val()).length : 0;
          setDynamicRatings(rc);
        }

        // Played list count
        const playedSnap = await get(ref(db, `users/${targetUid}/played`));
        if (!cancelled) {
          const pc = playedSnap.exists() ? Object.keys(playedSnap.val()).length : 0;
          setDynamicPlayed(pc);
        }

        // Wishlist count
        const wishlistSnap = await get(ref(db, `users/${targetUid}/wishlist`));
        if (!cancelled) {
          const wc = wishlistSnap.exists() ? Object.keys(wishlistSnap.val()).length : 0;
          setDynamicWishlist(wc);
        }
      } catch (e) {
        if (!cancelled) {
          // Fallback to zeros only if dynamic states untouched
          setDynamicRatings(r => (r === null ? 0 : r));
          setDynamicPlayed(p => (p === null ? 0 : p));
          setDynamicWishlist(w => (w === null ? 0 : w));
        }
      }
    };
    fetchCounts();
    return () => { cancelled = true; };
  }, [targetUid]);

  const ratingsCount = (dynamicRatings !== null) ? dynamicRatings : (viewedUser?.ratingsCount ?? viewedUser?.ratings_count ?? 0);
  const playedCount = (dynamicPlayed !== null) ? dynamicPlayed : (viewedUser?.playedCount ?? viewedUser?.played_count ?? 0);
  const wishlistCount = (dynamicWishlist !== null) ? dynamicWishlist : (viewedUser?.wishlistCount ?? viewedUser?.wishlist_count ?? 0);

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
    // Navigate to Library tab, passing target user + initialTab + display name
    navigation.navigate('Library', {
      screen: 'LibraryMain',
      params: {
        initialTab: tabKey,
        userId: viewedUser?.id || viewedUser?.uid || viewedUser?.firebaseKey,
        viewedUsername: username,
      },
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

        {/* Follow button full width (no Message button on searched profiles) */}
        <View style={searchedProfileScreenStyles.followMessageButtonRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              searchedProfileScreenStyles.followMessageButton,
              isFollowing && { backgroundColor: '#303341' },
            ]}
            activeOpacity={0.85}
            onPress={handleFollow}
            disabled={followLoading}
          >
            <Text style={styles.actionButtonText}>
              {followLoading
                ? (isFollowing ? 'Unfollowing...' : 'Following...')
                : (isFollowing ? 'Unfollow' : 'Follow')}
            </Text>
          </TouchableOpacity>
        </View>

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
