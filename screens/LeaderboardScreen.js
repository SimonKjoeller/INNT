import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '../database/firebase';
import { ref, get } from 'firebase/database';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../components/Auth';

// Fetch all users and follower counts then render a ranked list
export default function LeaderboardScreen({ navigation }) {
  const { user } = useAuth();
  const currentUid = user?.uid || null;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Pull followers tree (followers/<uid>/<followerUid>)
        const followersSnap = await get(ref(db, 'followers'));
        const followerCounts = {};
        if (followersSnap.exists()) {
          const followersRoot = followersSnap.val();
          Object.keys(followersRoot).forEach(targetUid => {
            const followersObj = followersRoot[targetUid];
            followerCounts[targetUid] = followersObj ? Object.keys(followersObj).length : 0;
          });
        }
        // Pull users list
        const usersSnap = await get(ref(db, 'users'));
        const usersArr = [];
        if (usersSnap.exists()) {
          const usersRoot = usersSnap.val();
          Object.keys(usersRoot).forEach(uid => {
            const u = usersRoot[uid] || {};
            const displayName = u.username || u.displayName || u.name || 'Unknown';
            usersArr.push({
              uid,
              displayName,
              followerCount: followerCounts[uid] || 0,
            });
          });
        }
        // Include current user even if missing in users path
        if (currentUid && !usersArr.find(e => e.uid === currentUid)) {
          usersArr.push({ uid: currentUid, displayName: user?.displayName || 'You', followerCount: followerCounts[currentUid] || 0 });
        }

        usersArr.sort((a, b) => b.followerCount - a.followerCount || a.displayName.localeCompare(b.displayName));
        setEntries(usersArr);
      } catch (e) {
        console.error('Leaderboard load error', e);
        setError('Failed to load leaderboard');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUid, user?.displayName]);

  const currentRank = useMemo(() => {
    const idx = entries.findIndex(e => e.uid === currentUid);
    return idx >= 0 ? idx + 1 : null;
  }, [entries, currentUid]);

  const handlePressUser = (entry) => {
    // Navigate to searched profile (ensure route exists in ProfileStack)
    navigation.navigate('SearchedProfile', { viewedUser: { id: entry.uid, username: entry.displayName } });
  };

  const renderItem = ({ item, index }) => {
    const isCurrent = item.uid === currentUid;
    const rank = index + 1;
    
    // Determine tier styling with brighter colors and larger sizes
    let tierStyle, tierRankColor, tierNameSize, tierRowPadding, tierRankSize, tierBg, tierNameColor;
    if (rank === 1) {
      tierStyle = 'gold';
      tierRankColor = '#FFD700';
      tierNameColor = '#FFD700';
      tierNameSize = 24;
      tierRankSize = 36;
      tierRowPadding = 20;
      tierBg = '#4a3f1a';
    } else if (rank === 2) {
      tierStyle = 'silver';
      // Brighter, more chrome-like silver
      tierRankColor = '#E5E5E5';
      tierNameColor = '#c4c2c2ff';
      tierNameSize = 22;
      tierRankSize = 32;
      tierRowPadding = 18;
      tierBg = '#58585cff';
    } else if (rank === 3) {
      tierStyle = 'bronze';
      tierRankColor = '#CD7F32';
      tierNameColor = '#CD7F32';
      tierNameSize = 20;
      tierRankSize = 28;
      tierRowPadding = 16;
      tierBg = '#3f2f1a';
    } else {
      tierStyle = 'rest';
      tierRankColor = '#888';
      tierNameColor = '#aaa';
      tierNameSize = 16;
      tierRankSize = 20;
      tierRowPadding = 12;
      tierBg = '#22252d';
    }

    return (
      <TouchableOpacity
        style={[
          styles.row,
          { paddingVertical: tierRowPadding, backgroundColor: tierBg },
          isCurrent && styles.currentRow
        ]}
        activeOpacity={0.75}
        onPress={() => handlePressUser(item)}
      >
        <View style={styles.rankWrap}>
          <Text style={[styles.rank, { color: tierRankColor, fontSize: tierRankSize, fontWeight: '800' }]}>{rank}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.name, { fontSize: tierNameSize, color: isCurrent ? '#ffd369' : tierNameColor, fontWeight: '700' }]} numberOfLines={1}>
            {item.displayName}
          </Text>
          <View style={styles.metaLine}>
            <Icon name="people" size={12} color={isCurrent ? '#ffd369' : '#8a8f98'} />
            <Text style={[styles.followers, isCurrent && styles.currentFollowers]}>{item.followerCount} follower{item.followerCount === 1 ? '' : 's'}</Text>
          </View>
        </View>
        {isCurrent && (
          <View style={styles.youBadge}> 
            <Text style={styles.youText}>YOU</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Followers Leaderboard</Text>
        {currentRank && (
          <Text style={styles.subtitle}>Your Rank: #{currentRank}</Text>
        )}
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181A20', paddingTop: 8 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#ffffff', letterSpacing: 0.5 },
  subtitle: { fontSize: 12, color: '#9aa0a6', marginTop: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22252d',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  currentRow: { backgroundColor: '#2c3140', borderWidth: 1, borderColor: '#6756fcff' },
  rankWrap: { width: 40, alignItems: 'center' },
  rank: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  currentRank: { color: '#ffd369' },
  userInfo: { flex: 1, paddingRight: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  currentName: { color: '#ffd369' },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  followers: { fontSize: 12, color: '#8a8f98', fontWeight: '600' },
  currentFollowers: { color: '#ffd369' },
  youBadge: { backgroundColor: '#6756fcff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  youText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, color: '#9aa0a6' },
  errorText: { color: '#ff6b6b', fontWeight: '600' },
});
