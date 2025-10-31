import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles/trendingScreenStyles';
import globalStyles from '../styles/globalStyles';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../database/firebase';
import sessionCache from '../caching/sessionCache'; // session in-memory cache
import listCache from '../caching/listCache';       // track list-sourced cached keys

const TrendingPage = () => {
  // Henter top 32 spil sorteret på reviewCount fra Firebase Realtime Database.
  const [trendingGames, setTrendingGames] = useState([]);

  useEffect(() => {
    fetchTrendingGames();
  }, []);

  // Henter de 32 mest anmeldte spil (top efter reviewCount) fra 'games'
  const fetchTrendingGames = async () => {
    try {
      const gamesRef = ref(db, 'games');
      const topQuery = query(gamesRef, orderByChild('reviewCount'), limitToLast(32)); // hent 32 mest populære

      const snapshot = await get(topQuery);

      if (snapshot.exists()) {
        const gamesArray = [];
        snapshot.forEach((childSnapshot) => {
          const gameData = childSnapshot.val();
          gamesArray.push({
            firebaseKey: childSnapshot.key,
            id: gameData?.id || childSnapshot.key,
            ...gameData
          });
        });

        // Firebase returnerer stigende rækkefølge -> vend for mest populære først
        gamesArray.reverse();

        // Normaliser billedkilde så både lokale require() og eksterne URLs virker
        const normalized = gamesArray.map(g => {
          // Hvis der findes coverUrl brug det, ellers bevar eksisterende image-field
          const imageCandidate = g.coverUrl || g.image || null;
          return { ...g, image: imageCandidate };
        });

        // Cache kun de normaliserede items vi viser i Trending (kun ved cache-miss)
        try {
          for (const entry of normalized) {
            const key = entry.firebaseKey;
            const already = sessionCache.get(key);
            if (!already) {
              const cachedEntry = { ...entry, __cachedFromSource: 'trending' };
              sessionCache.set(key, cachedEntry);
              console.log(`[TrendingPage] cached game ${key}`);
              const ev = listCache.add(key);
              if (ev) console.log(`[TrendingPage] listCache evicted: ${ev}`);
            }
          }
        } catch (e) {
          console.log('[TrendingPage] cache loop error', e?.message || e);
        }

        setTrendingGames(normalized);
      } else {
        // Ingen data fundet -> sæt tom liste
        setTrendingGames([]);
      }
    } catch (error) {
      console.error('Fejl ved hentning af trending spil:', error);
      setTrendingGames([]);
    }
  };

  const renderGameCard = (game) => {
    // Vælg korrekt Image source: lokal require() eller fjern-URL
    let imageSource = null;
    if (typeof game.image === 'number') {
      imageSource = game.image; // lokal asset
    } else if (typeof game.image === 'string' && game.image.length > 0) {
      imageSource = { uri: game.image };
    } else if (typeof game.coverUrl === 'string' && game.coverUrl.length > 0) {
      imageSource = { uri: game.coverUrl };
    }

    return (
      <TouchableOpacity key={game.id} style={styles.gameCard}>
        {imageSource ? (
          <Image source={imageSource} style={styles.gameImage} />
        ) : (
          // Hvis ingen billede-kilde -> vis tom boks (bevarer layout)
          <View style={[styles.gameImage, { backgroundColor: '#cccccc' }]} />
        )}
        <View style={styles.gameInfo}>
          {/* Intet ændret i layoutet — ingen tekstfelt i dette design */}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRow = (games, rowIndex) => (
    <View key={rowIndex} style={styles.row}>
      {games.map(game => renderGameCard(game))}
    </View>
  );

  // Grupperer spil i rækker af 4 (samme opførsel som før)
  const gameRows = [];
  for (let i = 0; i < trendingGames.length; i += 4) {
    gameRows.push(trendingGames.slice(i, i + 4));
  }

  return (
    <View style={[globalStyles.container, styles.customBackground]}>
      <ScrollView 
        style={[globalStyles.scrollView, styles.scrollView]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[globalStyles.scrollContent, styles.scrollContent]}
      >
        {gameRows.map((row, index) => renderRow(row, index))}
      </ScrollView>
    </View>
  );
};

export default TrendingPage;