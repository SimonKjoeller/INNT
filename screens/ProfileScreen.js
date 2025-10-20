import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../components/Auth';
import { styles } from '../styles/styles';

const logo = require('../assets/icon.png');

export default function ProfileScreen() {
  const { user, logout } = useAuth(); // Hent bruger + logout funktion
  const email = user?.email || 'Unknown user'; // Fallback hvis ingen bruger

  // Disse stats skal i fremtiden hentes dynamisk fra brugerdata database
  const stats = [
    { label: 'Ratings', value: 12 },
    { label: 'Favorites', value: 4 },
    { label: 'Gamelist', value: 9 },
  ];

  return (
    <View style={styles.profileContainer}>
       {/* ScrollView så siden kan udvides med mere indhold uden overflow */}
      <ScrollView style={styles.profileScroll} contentContainerStyle={styles.profileScrollContent}>
        {/* Header sektion med logo og email */}
        <View style={styles.profileHeader}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* Statistik kort i en Listerække */}    
        <View style={styles.statRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
        
        {/* Handlingsknapper til fremtidige features */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.85}>
            <Text style={styles.actionButtonText}>Rate Game</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]} activeOpacity={0.85}>
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Logout knap */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={logout}>
          <Text style={styles.actionButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Ekstra afstand så indhold ikke skjules bag footer */}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
}
