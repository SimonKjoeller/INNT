import React, { useEffect } from 'react';
import { View } from 'react-native';
import { RateGameDetail } from '../components/RateGame';


const RateGameScreen = ({ route, navigation }) => {
    const { gameId, fromScreen } = route.params || { gameId: '1', fromScreen: 'Home' };

    useEffect(() => {
        navigation.setOptions({ headerTitle: fromScreen === 'Search' ? 'Search' : 'Home' });
    }, [fromScreen, navigation]);

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
