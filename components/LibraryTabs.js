import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { libraryStyles } from '../styles/libraryStyles';
import WantToPlayList from './WantToPlayList';
import PlayedGamesList from './PlayedGamesList';
import RatedGamesList from './RatedGamesList';
import { useAuth } from './Auth';

const LibraryTabs = ({ navigation, userId, initialTab }) => {
    const [activeTab, setActiveTab] = useState(initialTab || 'wishlist');
    const { user } = useAuth();
    const effectiveUserId = useMemo(() => userId || user?.uid || null, [userId, user]);

    const tabs = [
        {
            key: 'wishlist',
            title: 'Want to Play',
            component: WantToPlayList
        },
        {
            key: 'played',
            title: 'Played',
            component: PlayedGamesList
        },
        {
            key: 'rated',
            title: 'Rated Games',
            component: RatedGamesList
        }
    ];

    // Opdater aktiv fane hvis initialTab ændres via navigation
    useEffect(() => {
        if (!initialTab) return;
        const keys = tabs.map(t => t.key);
        if (keys.includes(initialTab)) {
            setActiveTab(initialTab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialTab]);

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
                    numberOfLines={1}
                    ellipsizeMode="clip"
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
                userId={effectiveUserId}
            />
        );
    };

    return (
        <View style={libraryStyles.container}>
            {/* Tab Navigation */}
            <View style={libraryStyles.tabContainer}>
                {tabs.map((tab, index) => (
                    <React.Fragment key={tab.key}>
                        {renderTabButton(tab)}
                        {index < tabs.length - 1 && (
                            <View style={libraryStyles.tabDivider} />
                        )}
                    </React.Fragment>
                ))}
            </View>

            {/* Tab Content */}
            {renderActiveContent()}
        </View>
    );
};

export default LibraryTabs;
