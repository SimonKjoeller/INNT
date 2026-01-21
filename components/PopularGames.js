import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database'; 
import { db } from '../database/firebase'; // Import af Firebase-databasen
import { popularGamesStyles } from '../styles/homeStyles';
import sessionCache from '../caching/sessionCache'; // Session-cache til at genbruge spil-data på klik
import listCache from '../caching/listCache'; // Track list-sourced cached keys

const PopularGames = ({ navigation }) => {
    const [popularGames, setPopularGames] = useState([]); // State til at gemme populære spil
    const [loading, setLoading] = useState(true); // State til at vise "Loading..." mens data hentes

    // useEffect kaldes kun én gang når komponenten indlæses
    useEffect(() => {
        fetchPopularGames();
    }, []);

    // Funktion der henter populære spil fra Firebase
    const fetchPopularGames = async () => {
        try {
            const gamesRef = ref(db, 'games'); // Reference til "games" i databasen

            // 1. Opret forespørgsel: sortér efter 'reviewCount' og hent de sidste 10 (de mest populære)
            const topGamesQuery = query(
                gamesRef,
                orderByChild('reviewCount'), // Sortér efter egenskaben 'reviewCount'
                limitToLast(10)              // Hent de 10 spil med flest anmeldelser
            );

            // 2. Udfør forespørgslen
            const snapshot = await get(topGamesQuery); // Hent data baseret på forespørgslen

            if (snapshot.exists()) {
                const gamesArray = [];

                // Firebase returnerer data i stigende rækkefølge, så de mest populære er sidst i listen.
                // Vi vender derfor rækkefølgen senere.
                snapshot.forEach((childSnapshot) => {
                    const gameData = childSnapshot.val();
                    const entry = {
                        firebaseKey: childSnapshot.key, // Game ID
                        id: gameData?.id || childSnapshot.key, // 
                        ...gameData // Tilføj alle andre egenskaber for spillet
                    };
                    gamesArray.push(entry);
                });

                // Vend rækkefølgen så de mest populære spil vises først
                gamesArray.reverse();

                // Cache kun de endelige 10 items vi viser (undgå at logge ved hver fetch hvis allerede cachet)
                try {
                    for (const entry of gamesArray) {
                        const key = entry.firebaseKey;
                        const already = sessionCache.get(key);
                        if (!already) {
                            const cachedEntry = { ...entry, __cachedFromSource: 'popular' };
                            sessionCache.set(key, cachedEntry);
                            console.log(`[PopularGames] cached game ${key}`);
                            const evicted = listCache.add(key);
                            if (evicted) console.log(`[PopularGames] listCache evicted: ${evicted}`);
                        }
                    }
                } catch (e) {
                    console.log('[PopularGames] cache loop error', e?.message || e);
                }

                // Opdater state med de hentede spil
                setPopularGames(gamesArray);
            } else {
                console.log("Ingen populære spil fundet.");
            }
        } catch (error) {
            console.error('Fejl ved hentning af populære spil:', error);
        } finally {
            // Uanset hvad sætter vi loading til false, så UI opdateres
            setLoading(false);
        }
    };

    // Når brugeren trykker på et spil, navigeres der til 'RateGame'-skærmen
    const handleGamePress = (game) => {
        navigation.navigate('RateGame', { gameId: game.firebaseKey, fromScreen: 'Home' });
    };

    // Hvis data stadig indlæses
    if (loading) {
        return (
            <View style={popularGamesStyles.container}>
                <Text style={popularGamesStyles.title}>Popular Games</Text>
                <Text style={popularGamesStyles.loadingText}>Indlæser...</Text>
            </View>
        );
    }

    // Når data er hentet, vises spilkortene i en horisontal scroll
    return (
        <View style={popularGamesStyles.container}>
            <TouchableOpacity 
                style={popularGamesStyles.titleContainer}
                onPress={() => navigation.navigate('Popular')}
            >
                <Text style={popularGamesStyles.title}>Popular Games</Text>
                <Text style={popularGamesStyles.arrow}>›</Text>
            </TouchableOpacity>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={popularGamesStyles.scrollContainer}
            >
                {popularGames.map((game, index) => (
                    <TouchableOpacity
                        key={game.id} // Unik nøgle for hvert spil
                        style={[
                            popularGamesStyles.gameCard,
                            { marginLeft: index === 0 ? 20 : 10 },
                            { marginRight: index === popularGames.length - 1 ? 20 : 0 }
                        ]}
                        onPress={() => handleGamePress(game)} // Navigér når der trykkes
                    >
                        <Image
                            source={{ uri: game.coverUrl }} // Spillets cover-billede
                            style={popularGamesStyles.gameImage}
                            resizeMode="cover"
                        />
                        <View style={popularGamesStyles.gameInfo}>
                            <Text
                                style={popularGamesStyles.gameName}
                                numberOfLines={2} // Vis maks 2 linjer af spilnavnet
                            >
                                {game.name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default PopularGames;
