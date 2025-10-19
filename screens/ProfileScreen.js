import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../components/Auth';
import appStyles from '../styles/screenStyles';

// Fallback logo from current project assets
const logo = require('../assets/icon.png');

// Local styles layered on top of app styles without modifying global file
const styles = {
  ...appStyles,
  profileScroll: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  profileScrollContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
    borderRadius: 16,
  },
  userEmail: {
    color: '#cccccc',
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#242424',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#aaaaaa',
    marginTop: 4,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#3a3a3a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: '#2f2f2f',
  },
  logoutButton: {
    width: '90%',
    marginTop: 24,
    backgroundColor: '#8b0000',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    alignSelf: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const email = user?.email || 'Unknown user';

  const stats = [
    { label: 'Ratings', value: 12 },
    { label: 'Favorites', value: 4 },
    { label: 'Gamelist', value: 9 },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.profileScroll} contentContainerStyle={styles.profileScrollContent}>
        <View style={styles.profileHeader}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        <View style={styles.statRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.85}>
            <Text style={styles.actionButtonText}>Rate Game</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]} activeOpacity={0.85}>
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={logout}>
          <Text style={styles.actionButtonText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
