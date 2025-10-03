import React from 'react';
import { View } from 'react-native';
import { RateGameDetail } from '../components/RateGame';

const RateGameScreen = ({ route, navigation }) => {
    const { gameId } = route.params || { gameId: '1' }; // Default til spil ID 1 hvis ingen param

    return (
        <View style={screenStyles.container}>
            <RateGameDetail gameId={gameId} navigation={navigation} />
        </View>
    );
};

const screenStyles = {
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
};

export default RateGameScreen;
