import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles/upcommingPageStyles';
import styles from '../styles/globalStyles';

const upcommingPage = () => {
  //sample data
  const upcommingGames = [
    { id: 1, title: 'Cyberpunk 2077', image: require('../assets/Cyberpunk_2077_box_art.jpg') },
    { id: 2, title: 'The Witcher 3', image: require('../assets/Witcher_3_cover_art.jpg') },
    { id: 3, title: 'Red Dead 2', image: 'https://via.placeholder.com/150x200/2ECC71/FFFFFF?text=Game+3' },
    { id: 4, title: 'GTA V', image: 'https://via.placeholder.com/150x200/F39C12/FFFFFF?text=Game+4' },
    { id: 5, title: 'Minecraft', image: 'https://via.placeholder.com/150x200/9B59B6/FFFFFF?text=Game+5' },
    { id: 6, title: 'Fortnite', image: 'https://via.placeholder.com/150x200/1ABC9C/FFFFFF?text=Game+6' },
    { id: 7, title: 'Call of Duty', image: 'https://via.placeholder.com/150x200/34495E/FFFFFF?text=Game+7' },
    { id: 8, title: 'FIFA 24', image: 'https://via.placeholder.com/150x200/E67E22/FFFFFF?text=Game+8' },
    { id: 9, title: 'Valorant', image: 'https://via.placeholder.com/150x200/8E44AD/FFFFFF?text=Game+9' },
    { id: 10, title: 'League of Legends', image: 'https://via.placeholder.com/150x200/27AE60/FFFFFF?text=Game+10' },
    { id: 11, title: 'Overwatch 2', image: 'https://via.placeholder.com/150x200/E74C3C/FFFFFF?text=Game+11' },
    { id: 12, title: 'Apex Legends', image: 'https://via.placeholder.com/150x200/3498DB/FFFFFF?text=Game+12' },
    { id: 13, title: 'God of War', image: 'https://via.placeholder.com/150x200/2C3E50/FFFFFF?text=Game+13' },
    { id: 14, title: 'Spider-Man 2', image: 'https://via.placeholder.com/150x200/C0392B/FFFFFF?text=Game+14' },
    { id: 15, title: 'Hogwarts Legacy', image: 'https://via.placeholder.com/150x200/16A085/FFFFFF?text=Game+15' },
    { id: 16, title: 'Starfield', image: 'https://via.placeholder.com/150x200/D35400/FFFFFF?text=Game+16' },
    { id: 17, title: 'Baldurs Gate 3', image: 'https://via.placeholder.com/150x200/7D3C98/FFFFFF?text=Game+17' },
    { id: 18, title: 'Diablo 4', image: 'https://via.placeholder.com/150x200/229954/FFFFFF?text=Game+18' },
    { id: 19, title: 'Street Fighter 6', image: 'https://via.placeholder.com/150x200/DC7633/FFFFFF?text=Game+19' },
    { id: 20, title: 'Mortal Kombat 1', image: 'https://via.placeholder.com/150x200/5B2C6F/FFFFFF?text=Game+20' },
    { id: 21, title: 'Elden Ring', image: 'https://via.placeholder.com/150x200/A569BD/FFFFFF?text=Game+21' },
    { id: 22, title: 'Halo Infinite', image: 'https://via.placeholder.com/150x200/48C9B0/FFFFFF?text=Game+22' },
    { id: 23, title: 'Assassins Creed', image: 'https://via.placeholder.com/150x200/F4D03F/FFFFFF?text=Game+23' },
    { id: 24, title: 'Destiny 2', image: 'https://via.placeholder.com/150x200/E8DAEF/FFFFFF?text=Game+24' },
    { id: 25, title: 'Rocket League', image: 'https://via.placeholder.com/150x200/85C1E9/FFFFFF?text=Game+25' },
    { id: 26, title: 'Fall Guys', image: 'https://via.placeholder.com/150x200/F8C471/FFFFFF?text=Game+26' },
    { id: 27, title: 'Among Us', image: 'https://via.placeholder.com/150x200/EC7063/FFFFFF?text=Game+27' },
    { id: 28, title: 'Roblox', image: 'https://via.placeholder.com/150x200/AED6F1/FFFFFF?text=Game+28' },
    { id: 29, title: 'Genshin Impact', image: 'https://via.placeholder.com/150x200/A9DFBF/FFFFFF?text=Game+29' },
    { id: 30, title: 'Final Fantasy XVI', image: 'https://via.placeholder.com/150x200/D7BDE2/FFFFFF?text=Game+30' },
    { id: 31, title: 'Hollow Knight', image: 'https://via.placeholder.com/150x200/2C3E50/FFFFFF?text=Game+31' },
    { id: 32, title: 'Hollow Knight Silksong', image: 'https://via.placeholder.com/150x200/34495E/FFFFFF?text=Game+32' },
  ];

  const renderGameCard = (game) => {
    return (
      <TouchableOpacity key={game.id} style={styles.gameCard}>
        <Image source={game.image} style={styles.gameImage} />
        <View style={styles.gameInfo}>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRow = (games, rowIndex) => (
    <View key={rowIndex} style={styles.row}>
      {games.map(game => renderGameCard(game))}
    </View>
  );

  // Grupperer spil i rækker af 4
  const gameRows = [];
  for (let i = 0; i < upcommingGames.length; i += 4) {
    gameRows.push(upcommingGames.slice(i, i + 4));
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {gameRows.map((row, index) => renderRow(row, index))}
      </ScrollView>
    </View>
  );
};

export default upcommingPage;