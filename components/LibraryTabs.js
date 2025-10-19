import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { libraryStyles } from '../styles/libraryStyles';
import WantToPlayList from './WantToPlayList';
import RatedGamesList from './RatedGamesList';

const LibraryTabs = ({ navigation, userId = "user1" }) => {
    const [activeTab, setActiveTab] = useState('wishlist');

    const tabs = [
        {
            key: 'wishlist',
            title: 'Want to Play',
            component: WantToPlayList
        },
        {
            key: 'rated',
            title: 'Rated Games',
            component: RatedGamesList
        }
    ];

    const renderTabButton = (tab) => {
        const isActive = activeTab === tab.key;

        return (
            <TouchableOpacity
                key={tab.key}
                style={[
                    libraryStyles.tabButton,
                    isActive ? libraryStyles.activeTab : libraryStyles.inactiveTab
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        libraryStyles.tabText,
                        isActive ? libraryStyles.activeTabText : libraryStyles.inactiveTabText
                    ]}
                >
                    {tab.title}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderActiveContent = () => {
        const activeTabData = tabs.find(tab => tab.key === activeTab);
        if (!activeTabData) return null;

        const ActiveComponent = activeTabData.component;
        return (
            <ActiveComponent
                navigation={navigation}
                userId={userId}
            />
        );
    };

    return (
        <View style={libraryStyles.container}>
            {/* Tab Navigation */}
            <View style={libraryStyles.tabContainer}>
                {tabs.map(renderTabButton)}
            </View>

            {/* Tab Content */}
            {renderActiveContent()}
        </View>
    );
};

export default LibraryTabs;
