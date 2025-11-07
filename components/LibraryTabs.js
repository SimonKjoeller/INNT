import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { libraryStyles } from '../styles/libraryStyles';
import WantToPlayList from './WantToPlayList';
import PlayedGamesList from './PlayedGamesList';
import RatedGamesList from './RatedGamesList';
import { useAuth } from './Auth';

const LibraryTabs = ({ navigation, userId, initialTab }) => {
    const [activeTab, setActiveTab] = useState(initialTab || 'wishlist');
    const { user } = useAuth();
    const [sortModes, setSortModes] = useState({ wishlist: 'added_desc', played: 'added_desc', rated: 'rated_at_desc' });
    const [showSortMenu, setShowSortMenu] = useState(false);
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
                sortMode={sortModes[activeTab]}
            />
        );
    };

    const setSortForActive = (mode) => {
        setSortModes(prev => ({ ...prev, [activeTab]: mode }));
        setShowSortMenu(false);
    };

    const renderSortMenu = () => {
        const isWishlistOrPlayed = activeTab === 'wishlist' || activeTab === 'played';
        const isRated = activeTab === 'rated';
        if (isWishlistOrPlayed) {
            const options = [
                { key: 'added_desc', label: 'Newest' },
                { key: 'added_asc', label: 'Oldest' },
            ];
            return (
                <View style={libraryStyles.sortMenuContainer}>
                    {options.map(opt => {
                        const active = sortModes[activeTab] === opt.key;
                        return (
                            <TouchableOpacity key={opt.key} style={[libraryStyles.sortButton, active ? libraryStyles.sortButtonActive : libraryStyles.sortButtonInactive]} onPress={() => setSortForActive(opt.key)} activeOpacity={0.8}>
                                <Text style={[libraryStyles.sortButtonText, active ? libraryStyles.sortButtonTextActive : libraryStyles.sortButtonTextInactive]}>{opt.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            );
        }
        if (isRated) {
            const options = [
                { key: 'rated_at_desc', label: 'Newest' },
                { key: 'rated_at_asc', label: 'Oldest' },
                { key: 'score_desc', label: 'Score ↓' },
                { key: 'score_asc', label: 'Score ↑' },
            ];
            return (
                <View style={libraryStyles.sortMenuContainer}>
                    {options.map(opt => {
                        const active = sortModes[activeTab] === opt.key;
                        return (
                            <TouchableOpacity key={opt.key} style={[libraryStyles.sortButton, active ? libraryStyles.sortButtonActive : libraryStyles.sortButtonInactive]} onPress={() => setSortForActive(opt.key)} activeOpacity={0.8}>
                                <Text style={[libraryStyles.sortButtonText, active ? libraryStyles.sortButtonTextActive : libraryStyles.sortButtonTextInactive]}>{opt.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            );
        }
        return null;
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

            {/* Sort icon/top bar */}
            <View style={libraryStyles.sortTopBar}>
                <TouchableOpacity onPress={() => setShowSortMenu(v => !v)} style={libraryStyles.sortIconButton} activeOpacity={0.7}>
                    <Icon name="swap-vertical" size={18} color="#ccc" />
                    <Text style={libraryStyles.sortCurrentText}>
                        {(() => {
                            const k = sortModes[activeTab];
                            const map = {
                                added_desc: 'Newest', added_asc: 'Oldest',
                                rated_at_desc: 'Newest', rated_at_asc: 'Oldest',
                                score_desc: 'Score ↓', score_asc: 'Score ↑'
                            };
                            return map[k] || 'Sort';
                        })()}
                    </Text>
                </TouchableOpacity>
                {showSortMenu && (
                    <View style={libraryStyles.sortMenuDropdown}>
                        {(() => {
                            const isWishlistOrPlayed = activeTab === 'wishlist' || activeTab === 'played';
                            const isRated = activeTab === 'rated';
                            const options = isWishlistOrPlayed
                                ? [
                                    { key: 'added_desc', label: 'Newest' },
                                    { key: 'added_asc', label: 'Oldest' },
                                ]
                                : [
                                    { key: 'rated_at_desc', label: 'Newest' },
                                    { key: 'rated_at_asc', label: 'Oldest' },
                                    { key: 'score_desc', label: 'Score ↓' },
                                    { key: 'score_asc', label: 'Score ↑' },
                                ];
                            return options.map(opt => {
                                const active = sortModes[activeTab] === opt.key;
                                return (
                                    <TouchableOpacity
                                        key={opt.key}
                                        style={[libraryStyles.sortMenuItem, active ? libraryStyles.sortMenuItemActive : libraryStyles.sortMenuItemInactive]}
                                        onPress={() => setSortForActive(opt.key)}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={[libraryStyles.sortMenuItemText, active ? libraryStyles.sortMenuItemTextActive : libraryStyles.sortMenuItemTextInactive]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            });
                        })()}
                    </View>
                )}
            </View>
            {/* Tab Content */}
            {renderActiveContent()}
        </View>
    );
};

export default LibraryTabs;
