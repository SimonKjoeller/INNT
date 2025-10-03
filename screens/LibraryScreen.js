import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../styles/screenStyles';

const LibraryScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Library</Text>
            <Text style={styles.subtitle}>Your game collection</Text>
            
            <TouchableOpacity 
                style={libraryStyles.menuItem}
                onPress={() => navigation.navigate('GameList')}
            >
                <Icon name="game-controller" size={24} color="#fff" />
                <View style={libraryStyles.menuTextContainer}>
                    <Text style={libraryStyles.menuTitle}>Rate Games</Text>
                    <Text style={libraryStyles.menuSubtitle}>Rate and review your favorite games</Text>
                </View>
                <Icon name="chevron-forward" size={24} color="#aaa" />
            </TouchableOpacity>
        </View>
    );
};

const libraryStyles = {
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        marginHorizontal: 20,
        marginBottom: 15,
        padding: 20,
        borderRadius: 10,
    },
    menuTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    menuTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    menuSubtitle: {
        color: '#aaa',
        fontSize: 14,
    },
};

export default LibraryScreen;
