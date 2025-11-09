import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import navigationStyles from '../styles/navigationStyles';
import { AuthProvider, useAuth } from '../components/Auth';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import BrowseByScreen from '../screens/BrowseByScreen';
import RateGameScreen from '../screens/RateGameScreen';
import SearchedProfileScreen from '../screens/SearchedProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import LevelUpOverlay from '../components/LevelUpOverlay';
import FollowNotifications from '../components/FollowNotifications';
import RatingNotifications from '../components/RatingNotifications';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: navigationStyles.headerStyle,
        headerTintColor: navigationStyles.headerTintColor,
        headerTitleStyle: navigationStyles.headerTitleStyle,
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="Popular"
        component={BrowseByScreen}
        initialParams={{ mode: 'popular', limit: 24 }}
        options={{
          title: 'Popular',
          headerRight: () => (
            <Icon name="options-outline" size={26} color={navigationStyles.headerTintColor} style={{ marginRight: 16 }} />
          ),
        }}
      />
      <Stack.Screen
        name="Trending"
        component={BrowseByScreen}
        initialParams={{ mode: 'trending', limit: 24 }}
        options={{
          title: 'Trending',
          headerRight: () => (
            <Icon name="options-outline" size={26} color={navigationStyles.headerTintColor} style={{ marginRight: 16 }} />
          ),
        }}
      />
      <Stack.Screen
        name="BrowseBy"
        component={BrowseByScreen}
        options={{
          title: 'Browse',
        }}
      />
      <Stack.Screen
        name="Upcoming"
        component={BrowseByScreen}
        initialParams={{ mode: 'upcoming', limit: 24 }}
        options={{
          title: 'Upcoming',
          headerRight: () => (
            <Icon name="options-outline" size={26} color={navigationStyles.headerTintColor} style={{ marginRight: 16 }} />
          ),
        }}
      />
      <Stack.Screen
        name="RateGame"
        component={RateGameScreen}
        options={{
          title: 'Rate Game',
        }}
      />
      <Stack.Screen
        name="SearchedProfile"
        component={SearchedProfileScreen}
        options={{
          title: 'User Profile',
        }}
      />
    </Stack.Navigator>
  );
};

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
        name="Popular"
        component={BrowseByScreen}
        initialParams={{ mode: 'popular', limit: 24 }}
        options={{
          title: 'Popular',
          headerRight: () => (
            <Icon name="options-outline" size={26} color={navigationStyles.headerTintColor} style={{ marginRight: 16 }} />
          ),
        }}
      />
      <Stack.Screen
        name="Trending"
        component={BrowseByScreen}
        initialParams={{ mode: 'trending', limit: 24 }}
        options={{
          title: 'Trending',
          headerRight: () => (
            <Icon name="options-outline" size={26} color={navigationStyles.headerTintColor} style={{ marginRight: 16 }} />
          ),
        }}
      />
      <Stack.Screen
        name="BrowseBy"
        component={BrowseByScreen}
        options={{
          title: 'Browse',
        }}
      />
      <Stack.Screen
        name="Upcoming"
        component={BrowseByScreen}
        initialParams={{ mode: 'upcoming', limit: 24 }}
        options={{
          title: 'Upcoming',
          headerRight: () => (
            <Icon name="options-outline" size={26} color={navigationStyles.headerTintColor} style={{ marginRight: 16 }} />
          ),
        }}
      />
      <Stack.Screen
        name="RateGame"
        component={RateGameScreen}
        options={{
          title: 'Rate Game',
        }}
      />

      <Stack.Screen
        name="SearchedProfileScreen"
        component={SearchedProfileScreen}
        options={{
          title: 'User Profile',
        }}
      />
    </Stack.Navigator>
  );
};

const LibraryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: navigationStyles.headerStyle,
        headerTintColor: navigationStyles.headerTintColor,
        headerTitleStyle: navigationStyles.headerTitleStyle,
      }}
    >
      <Stack.Screen
        name="LibraryMain"
        component={LibraryScreen}
        options={{
          title: 'Library',
        }}
      />
      <Stack.Screen
        name="RateGame"
        component={RateGameScreen}
        options={{
          title: 'Rate Game',
        }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: navigationStyles.headerStyle,
        headerTintColor: navigationStyles.headerTintColor,
        headerTitleStyle: navigationStyles.headerTitleStyle,
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
        }}
      />
    </Stack.Navigator>
  );
};


const AppNavigator = () => {
  const RootNavigator = () => {
    const { user, initializing } = useAuth();

    if (initializing) {
      // Simple splash/loading; could be replaced with a dedicated component
      return null;
    }

    if (!user) {
      // Auth flow first
      return (
        <Stack.Navigator
          screenOptions={{
            headerStyle: navigationStyles.headerStyle,
            headerTintColor: navigationStyles.headerTintColor,
            headerTitleStyle: navigationStyles.headerTitleStyle,
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Sign In' }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ title: 'Create Account' }}
          />
        </Stack.Navigator>
      );
    }

    // Main app (tabs)
    return (
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
          component={HomeStack}
          options={{
            tabBarLabel: '',
            headerShown: false,
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
          component={LibraryStack}
          options={{
            title: 'Library',
            tabBarLabel: '',
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            title: 'Profile',
            tabBarLabel: '',
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    );
  };

  return (
    <AuthProvider>
      <>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <LevelUpOverlay />
        <FollowNotifications />
        <RatingNotifications />
      </>
    </AuthProvider>
  );
};

export default AppNavigator;
