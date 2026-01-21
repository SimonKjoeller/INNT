import React, { useEffect, useState, useMemo, useLayoutEffect } from 'react';
import { View, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import navigationStyles from '../styles/navigationStyles';
import FilterModal from '../components/FilterModal';
import styles from '../styles/browseByStyles';
import globalStyles from '../styles/globalStyles';
import { ref, get, query, orderByChild, limitToLast, startAt } from 'firebase/database';
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
  const genreKey = useMemo(() => (genreName || '').toLowerCase(), [genreName]); // Normalize for matching
  const [games, setGames] = useState([]);
  const [targetCount, setTargetCount] = useState(limit || 24);
  const [isFetching, setIsFetching] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterSort, setFilterSort] = useState(null); // 'Newest' | 'Oldest' | null
  const [filterGenre, setFilterGenre] = useState(null); // e.g. 'Adventure', 'Shooter', etc.

  useLayoutEffect(() => { 
    // Always use genreName if present, otherwise fallback to mode or 'Browse'
    let navTitle = genreName || 'Browse';
    if (!genreName) {
      if (mode === 'popular') navTitle = 'Popular';
      else if (mode === 'trending') navTitle = 'Trending';
      else if (mode === 'upcoming') navTitle = 'Upcoming';
    }
    navigation.setOptions({
      title: navTitle,
      headerRight: () => (
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
          <Icon name="options-outline" size={26} color={navigationStyles.headerTintColor} style={{ marginRight: 16 }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, genreName, mode]);


  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, genreKey, targetCount, filterSort, filterGenre]);

  const fetchData = async () => {
    try {
      const gamesRef = ref(db, 'games');
      const nowSeconds = Math.floor(Date.now() / 1000);
      const normalizeDate = (val) => {
        const n = Number(val);
        if (!isFinite(n)) return 0;
        if (n > 1e12) return Math.floor(n / 1000);
        if (n > 1e9) return n;
        if (n >= 1900 && n <= 3000) return Math.floor(new Date(n, 0, 1).getTime() / 1000);
        return n;
      };
      // For at sikre 24 rigtige genre-spil: hent i batches og filtrér indtil vi har nok
      const ensureAtLeast = async (needed) => {
        let limitToTry = Math.max(needed * 3, 200); // start larger to avoid many calls
        let collected = [];
        const isUpcoming = mode === 'upcoming';
        while (true) {
          const q = isUpcoming
            ? query(gamesRef, orderByChild('first_release_date'), limitToLast(limitToTry)) // Dette er et if statement, så hvis det er Upcoming, så brug denne query
            : query(gamesRef, orderByChild('reviewCount'), limitToLast(limitToTry));       // Ellers brug denne query
          const snap = await get(q);
          if (!snap.exists()) break;
          const arr = [];
          snap.forEach(child => {
            const g = child.val();
            arr.push({ firebaseKey: child.key, id: g?.id || child.key, ...g });
          });
          // Firebase returns ascending order; reverse to make newest last->first when needed
          arr.reverse();
          // Apply genre filter (from modal or route)
          let genreToUse = filterGenre || (mode === 'genre' ? genreKey : null);
          if (genreToUse) {
            collected = arr.filter(g => normalizeGenres(g.genres || g.genre || g.categories).includes(genreToUse.toLowerCase()));
          } else if (isUpcoming) {
            // Match PopularGames behavior: do not pre-filter by now, just use
            // ordering by first_release_date and take the top items (limitToLast).
            collected = arr;
          } else {
            collected = arr;
          }
          // Apply sort (from modal)
          if (filterSort === 'Oldest') {
            collected = [...collected].sort((a, b) => normalizeDate(a.first_release_date) - normalizeDate(b.first_release_date));
          } else if (filterSort === 'Newest') {
            collected = [...collected].sort((a, b) => normalizeDate(b.first_release_date) - normalizeDate(a.first_release_date));
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
          <View style={styles.gameImagePlaceholder} />
        )}
        <View style={styles.gameInfo} />
      </TouchableOpacity>
    );
  };

  const rows = [];
  for (let i = 0; i < games.length; i += 4) rows.push(games.slice(i, i + 4));

  return (
    <>
      <View style={[globalStyles.container, styles.customBackground]}>
        <FlatList
          data={games}
          keyExtractor={(item) => String(item.id)}
          numColumns={4}
          renderItem={({ item }) => renderCard(item)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[globalStyles.scrollContent, styles.scrollContent]}
          columnWrapperStyle={styles.columnWrapper}
          onEndReachedThreshold={0.4}
          onEndReached={handleEndReached}
          ListFooterComponent={isFetching ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color="#aaa" />
            </View>
          ) : null}
        />
      </View>
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={({ release, genre }) => {
          setFilterSort(release);
          setFilterGenre(genre);
        }}
        initialRelease={filterSort}
        initialGenre={filterGenre}
      />
    </>
  );
};

export default BrowseByScreen;


