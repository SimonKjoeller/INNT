/*import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../database/firebase';
import styles from '../styles/trendingScreenStyles';
import globalStyles from '../styles/globalStyles';
import sessionCache from '../caching/sessionCache';
import listCache from '../caching/listCache';

// Komponent: Viser en fuld oversigt over "Trending" spil.
// Strategi:
// 1) Hent top 100 spil efter reviewCount (antager at reviewCount er indekseret i RTDB rules).
// 2) Vend resultatet så de højeste værdier kommer først.
// 3) Udvælg de 32 nyeste blandt disse 100 baseret på first_release_date.
// 4) Cache kun de 32 viste elementer i sessionCache/listCache for hurtigere navigation.
const FullTrendingGames = ({ navigation }) => {
    // State: liste over trending-spil + simpel loading-flag til UI
    const [trendingGames, setTrendingGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ved mount: hent data én gang
        fetchTrendingGames();
    }, []);

    const fetchTrendingGames = async () => {
        try {
            // 1) Opsæt reference og query: sorter efter reviewCount og tag de sidste 100 (højeste værdier)
            const gamesRef = ref(db, 'games');
            const topGamesQuery = query(
                gamesRef,
                orderByChild('reviewCount'),
                limitToLast(100)
            );
            // 2) Læs snapshottet én gang (ingen realtime-lytning her)
            const snapshot = await get(topGamesQuery);
            if (snapshot.exists()) {
                // 3) Byg et array af spil-entries (inkl. firebaseKey og fallback-id)
                const gamesArray = [];
                snapshot.forEach((childSnapshot) => {
                    const gameData = childSnapshot.val();
                    const entry = {
                        firebaseKey: childSnapshot.key,
                        id: gameData?.id || childSnapshot.key,
                        ...gameData
                    };
                    gamesArray.push(entry);
                });
                // 4) Firebase returnerer stigende rækkefølge -> vend for at få "størst reviewCount først"
                gamesArray.reverse();
                // Select 32 newest by release date
                // 5) Blandt top 100: filtrér dem med first_release_date, sorter nyeste først og tag de første 32
                const newest32 = gamesArray
                    .filter(game => game.first_release_date)
                    .sort((a, b) => new Date(b.first_release_date) - new Date(a.first_release_date))
                    .slice(0, 32);
                // 6) Cache kun de faktiske 32 viste spil for hurtigere gensyn og navigation
                // Cache only the 32 items we actually show
                try {
                    for (const entry of newest32) {
                        const key = entry.firebaseKey;
                        const already = sessionCache.get(key);
                        if (!already) {
                            const cachedEntry = { ...entry, __cachedFromSource: 'trending' };
                            sessionCache.set(key, cachedEntry);
                            console.log(`[FullTrendingGames] cached game ${key}`);
                            const evicted = listCache.add(key);
                            if (evicted) console.log(`[FullTrendingGames] listCache evicted: ${evicted}`);
                        }
                    }
                } catch (e) {
                    console.log('[FullTrendingGames] cache loop error', e?.message || e);
                }
                // 7) Opdater state med de udvalgte 32
                setTrendingGames(newest32);
            }
        } catch (error) {
            // Fejlhåndtering: log til konsol og fortsæt til finally for at slå loading fra
            console.error('Error fetching trending games:', error);
        } finally {
            // Slå loading fra uanset udfald
            setLoading(false);
        }
    };

    const handleGamePress = (game) => {
        // Navigation: gå til RateGame og medbring firebaseKey som gameId
        navigation.navigate('RateGame', { gameId: game.firebaseKey });
    };

    if (loading) {
        return (
            <View style={globalStyles.container}>
                <Text style={styles.headerTitle}>Trending Games</Text>
                <Text style={styles.headerSubtitle}>Loading...</Text>
            </View>
        );
    }

    // Normalize image field for compatibility
    // Sørg for et konsistent billedfelt ved at vælge coverUrl eller image som kilde
    const normalizedGames = trendingGames.map(g => {
        const imageCandidate = g.coverUrl || g.image || null;
        return { ...g, image: imageCandidate };
    });

    // Group games into rows of 4
    // Layout: opdel i rækker á 4 for grid-agtig visning i ScrollView
    const gameRows = [];
    for (let i = 0; i < normalizedGames.length; i += 4) {
        gameRows.push(normalizedGames.slice(i, i + 4));
    }

    const renderGameCard = (game) => {
        // Håndter både lokale (number) og eksterne (string URI) image-kilder
        let imageSource = null;
        if (typeof game.image === 'number') {
            imageSource = game.image;
        } else if (typeof game.image === 'string' && game.image.length > 0) {
            imageSource = { uri: game.image };
        }
        return (
            <TouchableOpacity key={game.id} style={styles.gameCard} onPress={() => handleGamePress(game)}>
                {imageSource ? (
                    <Image source={imageSource} style={styles.gameImage} />
                ) : (
                    <View style={[styles.gameImage, { backgroundColor: '#cccccc' }]} />
                )}
                <View style={styles.gameInfo} />
            </TouchableOpacity>
        );
    };

    const renderRow = (games, rowIndex) => (
        // Render én række af 4 kort
        <View key={rowIndex} style={styles.row}>
            {games.map(game => renderGameCard(game))}
        </View>
    );

    return (
        <View style={[globalStyles.container, styles.customBackground]}>
            <ScrollView
                style={[globalStyles.scrollView, styles.scrollView]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[globalStyles.scrollContent, styles.scrollContent]}
            >
                {/* Render alle rækker *//*
                {gameRows.map((row, index) => renderRow(row, index))}
            </ScrollView>
        </View>
    );
};

export default FullTrendingGames;
/*;*/