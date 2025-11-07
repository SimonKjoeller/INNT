import React, { useEffect, useState, useMemo } from 'react';
import { View, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import styles from '../styles/browseByStyles';
import globalStyles from '../styles/globalStyles';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../database/firebase';

const normalizeGenres = (genres) => {
  if (!genres) return [];
  try {
    if (Array.isArray(genres)) {
      return genres.map(g => (typeof g === 'object' ? (g.name || g.title || String(g)) : String(g)).toLowerCase());
    }
    if (typeof genres === 'object') {
      return Object.values(genres).map(g => (typeof g === 'object' ? (g.name || g.title || String(g)) : String(g)).toLowerCase());
    }
    return [];
  } catch {
    return [];
  }
};

const BrowseByScreen = ({ route, navigation }) => {
  const { mode = 'genre', genreName, limit = 24 } = route.params || {};
  const genreKey = useMemo(() => (genreName || '').toLowerCase(), [genreName]);
  const [games, setGames] = useState([]);
  const [targetCount, setTargetCount] = useState(limit || 24);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: genreName || 'Browse' });
  }, [genreName, navigation]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, genreKey, targetCount]);

  const fetchData = async () => {
    try {
      const gamesRef = ref(db, 'games');
      // For at sikre 24 rigtige genre-spil: hent i batches og filtrér indtil vi har nok
      const ensureAtLeast = async (needed) => {
        let limitToTry = Math.max(needed * 3, 200); // start større for at undgå mange calls
        let collected = [];
        while (true) {
          const q = query(gamesRef, orderByChild('reviewCount'), limitToLast(limitToTry));
          const snap = await get(q);
          if (!snap.exists()) break;
          const arr = [];
          snap.forEach(child => {
            const g = child.val();
            arr.push({ firebaseKey: child.key, id: g?.id || child.key, ...g });
          });
          arr.reverse();
          if (mode === 'genre' && genreKey) {
            collected = arr.filter(g => normalizeGenres(g.genres || g.genre || g.categories).includes(genreKey));
          } else if (mode === 'upcoming') {
            const now = new Date();
            collected = arr.filter(g => g.first_release_date && new Date(g.first_release_date) > now);
          } else {
            collected = arr;
          }
          if (collected.length >= needed || limitToTry >= 2000) break;
          limitToTry = Math.min(limitToTry * 2, 2000);
        }
        return collected.slice(0, needed);
      };

      setIsFetching(true);
      const result = await ensureAtLeast(targetCount);
      setGames(result);
      setIsFetching(false);
    } catch (e) {
      console.error('[BrowseBy] fetch error', e);
      setGames([]);
      setIsFetching(false);
    }
  };

  const handleEndReached = () => {
    if (isFetching) return;
    setTargetCount(prev => prev + 24);
  };

  const renderCard = (game) => {
    const imageSource = game.coverUrl ? { uri: game.coverUrl } : null;
    return (
      <TouchableOpacity key={game.id} style={styles.gameCard} onPress={() => navigation.navigate('RateGame', { gameId: game.firebaseKey })}>
        {imageSource ? (
          <Image source={imageSource} style={styles.gameImage} />
        ) : (
          <View style={[styles.gameImage, { backgroundColor: '#cccccc' }]} />
        )}
        <View style={styles.gameInfo} />
      </TouchableOpacity>
    );
  };

  const rows = [];
  for (let i = 0; i < games.length; i += 4) rows.push(games.slice(i, i + 4));

  return (
    <View style={[globalStyles.container, styles.customBackground]}>
      <FlatList
        data={games}
        keyExtractor={(item) => String(item.id)}
        numColumns={4}
        renderItem={({ item }) => renderCard(item)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[globalStyles.scrollContent, styles.scrollContent]}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 18 }}
        onEndReachedThreshold={0.4}
        onEndReached={handleEndReached}
        ListFooterComponent={isFetching ? (
          <View style={{ paddingVertical: 16 }}>
            <ActivityIndicator size="small" color="#aaa" />
          </View>
        ) : null}
      />
    </View>
  );
};

export default BrowseByScreen;


