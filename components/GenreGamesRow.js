import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../database/firebase';
import { popularGamesStyles } from '../styles/homeStyles';
import sessionCache from '../caching/sessionCache';
import listCache from '../caching/listCache';

const normalizeGenres = (genres) => {
    if (!genres) return [];
    try {
        if (Array.isArray(genres)) {
            return genres.map(g => {
                if (typeof g === 'string') return g.toLowerCase();
                if (typeof g === 'number') return String(g);
                if (typeof g === 'object') return (g.name || g.title || String(g)).toLowerCase();
                return String(g).toLowerCase();
            });
        }
        if (typeof genres === 'object') {
            return Object.values(genres).map(g => {
                if (typeof g === 'string') return g.toLowerCase();
                if (typeof g === 'number') return String(g);
                if (typeof g === 'object') return (g.name || g.title || String(g)).toLowerCase();
                return String(g).toLowerCase();
            });
        }
        return [];
    } catch {
        return [];
    }
};

const GenreGamesRow = ({ navigation, genreName, limit = 10 }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const genreKey = useMemo(() => (genreName || '').toLowerCase(), [genreName]);

    useEffect(() => {
        fetchGenre();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [genreKey]);

    const fetchGenre = async () => {
        try {
            setLoading(true);
            const gamesRef = ref(db, 'games');
            // Tag mange nok til at kunne filtrere på genre
            const topQuery = query(gamesRef, orderByChild('reviewCount'), limitToLast(200));
            const snapshot = await get(topQuery);

            if (!snapshot.exists()) {
                setGames([]);
                return;
            }

            const tmp = [];
            snapshot.forEach(child => {
                const gameData = child.val();
                tmp.push({ firebaseKey: child.key, id: gameData?.id || child.key, ...gameData });
            });

            // Mest populære først
            tmp.reverse();

            const filtered = tmp.filter(g => {
                const arr = normalizeGenres(g.genres || g.genre || g.categories);
                return arr.includes(genreKey);
            }).slice(0, limit);

            // let cache track
            try {
                for (const entry of filtered) {
                    const key = entry.firebaseKey;
                    const already = sessionCache.get(key);
                    if (!already) {
                        const cachedEntry = { ...entry, __cachedFromSource: `genre:${genreKey}` };
                        sessionCache.set(key, cachedEntry);
                        const evicted = listCache.add(key);
                        if (evicted) console.log(`[Genre:${genreKey}] listCache evicted: ${evicted}`);
                    }
                }
            } catch {}

            setGames(filtered);
        } catch (e) {
            console.error(`[Genre:${genreKey}] fetch error`, e);
            setGames([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePress = (game) => {
        navigation.navigate('RateGame', { gameId: game.firebaseKey, fromScreen: 'Home' });
    };

    if (loading) {
        return (
            <View style={popularGamesStyles.container}>
                <Text style={popularGamesStyles.title}>{genreName}</Text>
                <Text style={popularGamesStyles.loadingText}>Indlæser...</Text>
            </View>
        );
    }

    if (!games.length) return null;

    return (
        <View style={popularGamesStyles.container}>
            <TouchableOpacity 
                style={popularGamesStyles.titleContainer}
                onPress={() => navigation.navigate('BrowseBy', { mode: 'genre', genreName, limit: 24 })}
                activeOpacity={0.7}
            >
                <Text style={popularGamesStyles.title}>{genreName}</Text>
                <Text style={popularGamesStyles.arrow}>›</Text>
            </TouchableOpacity>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={popularGamesStyles.scrollContainer}
            >
                {games.map((game, index) => (
                    <TouchableOpacity
                        key={game.id}
                        style={[
                            popularGamesStyles.gameCard,
                            { marginLeft: index === 0 ? 20 : 10 },
                            { marginRight: index === games.length - 1 ? 20 : 0 }
                        ]}
                        onPress={() => handlePress(game)}
                    >
                        <Image
                            source={{ uri: game.coverUrl }}
                            style={popularGamesStyles.gameImage}
                            resizeMode="cover"
                        />
                        <View style={popularGamesStyles.gameInfo}>
                            <Text style={popularGamesStyles.gameName} numberOfLines={2}>{game.name}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default GenreGamesRow;


