import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles/trendingScreenStyles';
import globalStyles from '../styles/globalStyles';

const TrendingPage = () => {
  //sample data
  const trendingGames = [
    { id: 1, title: 'Cyberpunk 2077', image: require('../assets/Cyberpunk_2077_box_art.jpg') },
    { id: 2, title: 'The Witcher 3', image: require('../assets/Witcher_3_cover_art.jpg') },
    { id: 3, title: 'Red Dead 2', image: require('../assets/Red_Dead.jpg') },
    { id: 4, title: 'GTA V', image: require('../assets/GTAV.jpg') },
    { id: 5, title: 'Minecraft', image: require('../assets/Minecraft.jpg') },
    { id: 6, title: 'Fortnite', image: require('../assets/Fortnite.jpg') },
    { id: 7, title: 'Call of Duty', image: require('../assets/COD_Black_Ops_4.jpg') },
    { id: 8, title: 'FIFA 25', image: require('../assets/FC25.jpg') },
    { id: 9, title: 'Valorant', image: require('../assets/Valorant.jpg') },
    { id: 10, title: 'League of Legends', image: require('../assets/League_Of_Legends.jpg') },
    { id: 11, title: 'Overwatch 2', image: require('../assets/Overwatch.jpg') },
    { id: 12, title: 'Apex Legends', image: require('../assets/Apex_Legends.jpg') },
    { id: 13, title: 'God of War', image: require('../assets/God_of_War_4.jpg') },
    { id: 14, title: 'Spider-Man', image: require('../assets/Spider-Man_PS4.jpg') },
    { id: 15, title: 'Hogwarts Legacy', image: require('../assets/Hogwarts_legacy.jpg') },
    { id: 16, title: 'Starfield', image: require('../assets/Starfield.jpg') },
    { id: 17, title: 'Baldurs Gate 3', image: require('../assets/Baldurs_Gate_3.jpg') },
    { id: 18, title: 'Diablo 4', image: require('../assets/D4.jpg') },
    { id: 19, title: 'Street Fighter 6', image: require('../assets/Street_Fighter_6.jpg') },
    { id: 20, title: 'Mortal Kombat 1', image: require('../assets/Mortal_Kombat_1_key_ar.jpeg') },
    { id: 21, title: 'Elden Ring', image: require('../assets/Elden_Ring.jpg') },
    { id: 22, title: 'Halo Infinite', image: require('../assets/Halo_Infinite.jpg') },
    { id: 23, title: 'Assassins Creed', image: require('../assets/AC_Shadows.jpg') },
    { id: 24, title: 'Destiny 2', image: require('../assets/Destiny_2.jpg') },
    { id: 25, title: 'Rocket League', image: require('../assets/Rocket_League.jpg') },
    { id: 26, title: 'Fall Guys', image: require('../assets/Fall_Guys.jpg') },
    { id: 27, title: 'Among Us', image: require('../assets/Among_Us.jpg') },
    { id: 28, title: 'Roblox', image: require('../assets/roblox.jpg') },
    { id: 29, title: 'Genshin Impact', image: require('../assets/Genshin_impact.jpg') },
    { id: 30, title: 'Final Fantasy VII', image: require('../assets/FFVIIRemake.jpg') },
    { id: 31, title: 'Hollow Knight', image: require('../assets/Hollow_Knight.jpg') },
    { id: 32, title: 'Hollow Knight Silksong', image: require('../assets/Silksong.jpg') },
  ];

  const renderGameCard = ({ item }) => {
    return (
      <TouchableOpacity style={styles.gameCard}>
        <Image source={item.image} style={styles.gameImage} />
        <View style={styles.gameInfo}>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={trendingGames}
        renderItem={renderGameCard}
        numColumns={4}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

export default TrendingPage;