import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import navigationStyles from '../styles/navigationStyles';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TrendingScreen from '../screens/TrendingScreen';
import UpcomingScreen from '../screens/UpcomingScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


const SearchStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: navigationStyles.headerStyle,
        headerTintColor: navigationStyles.headerTintColor,
        headerTitleStyle: navigationStyles.headerTitleStyle,
      }}
    >
      <Stack.Screen 
        name="SearchMain" 
        component={SearchScreen} 
        options={{ 
          title: 'Search',
        }}
      />
      <Stack.Screen 
        name="Trending" 
        component={TrendingScreen} 
        options={{ 
          title: 'Trending',
        }}
      />
      <Stack.Screen 
        name="Upcoming" 
        component={UpcomingScreen} 
        options={{ 
          title: 'Upcoming',
        }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Library') {
              iconName = focused ? 'library' : 'library-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: navigationStyles.tabBarActiveTintColor,
          tabBarInactiveTintColor: navigationStyles.tabBarInactiveTintColor,
          tabBarStyle: navigationStyles.tabBarStyle,
          tabBarLabelStyle: navigationStyles.tabBarLabelStyle,
          headerStyle: navigationStyles.headerStyle,
          headerTintColor: navigationStyles.headerTintColor,
          headerTitleStyle: navigationStyles.headerTitleStyle,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarLabel: '',
          }}
        />
        <Tab.Screen 
          name="Search" 
          component={SearchStack}
          options={{
            tabBarLabel: '',
            headerShown: false, //gemmer search headeren
          }}
        />
        <Tab.Screen 
          name="Library" 
          component={LibraryScreen}
          options={{
            title: 'Library',
            tabBarLabel: '',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'Profile',
            tabBarLabel: '',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
