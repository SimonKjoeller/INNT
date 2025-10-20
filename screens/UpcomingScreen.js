//work in progress
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

const UpcomingScreen = () => {
  // Henter top 32 spil baseret på reviewCount til "Upcoming" visningen (kun data, layout uændret)
  const [upcomingGames, setUpcomingGames] = useState([]);

  useEffect(() => {
    fetchUpcomingGames();
  }, []);

  // Hent top 32 fra Firebase (samme logik som i TrendingPage)
  const fetchUpcomingGames = async () => {
    try {
      const gamesRef = ref(db, 'games');
      const topQuery = query(gamesRef, orderByChild('reviewCount'), limitToLast(32));

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

        // Normaliser billedfelt så eksisterende layout kan bruge game.image (lokal require eller URL)
        const normalized = gamesArray.map(g => {
          const imageCandidate = g.coverUrl || g.image || null;
          return { ...g, image: imageCandidate };
        });

        setUpcomingGames(normalized);
      } else {
        setUpcomingGames([]);
      }
    } catch (error) {
      console.error('Fejl ved hentning af upcoming spil:', error);
      setUpcomingGames([]);
    }
  };

  const renderGameCard = (game) => {
    // Vælg korrekt Image source: lokal require() eller fjern-URL (holder layout uændret)
    let imageSource = null;
    if (typeof game.image === 'number') {
      imageSource = game.image;
    } else if (typeof game.image === 'string' && game.image.length > 0) {
      imageSource = { uri: game.image };
    }

    return (
      <TouchableOpacity key={game.id} style={styles.gameCard}>
        {imageSource ? (
          <Image source={imageSource} style={styles.gameImage} />
        ) : (
          <View style={[styles.gameImage, { backgroundColor: '#cccccc' }]} />
        )}
        <View style={styles.gameInfo}>
          {/* Layout uændret */}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRow = (games, rowIndex) => (
    <View key={rowIndex} style={styles.row}>
      {games.map(game => renderGameCard(game))}
    </View>
  );

  // Beholder samme gruppering i rækker af 4
  const gameRows = [];
  for (let i = 0; i < upcomingGames.length; i += 4) {
    gameRows.push(upcomingGames.slice(i, i + 4));
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

export default UpcomingScreen;