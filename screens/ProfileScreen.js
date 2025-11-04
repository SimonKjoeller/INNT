import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../components/Auth';
import { styles } from '../styles/styles';
import { db } from '../database/firebase';
import { ref, query, orderByChild, equalTo, onValue, off } from 'firebase/database';

const logo = require('../assets/icon.png');

export default function ProfileScreen() {
  const { user, logout, username } = useAuth(); // Henter user, logout + brugernavn fra context
  const displayName = username || 'Unknown user';

  const [ratingsCount, setRatingsCount] = useState(0);
  const [playedCount, setPlayedCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Realtime lyttere: opdater counts så snart data ændres
  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setRatingsCount(0);
      setPlayedCount(0);
      setWishlistCount(0);
      return;
    }

    const wishlistRef = ref(db, `users/${uid}/wishlist`);
    const playedRef = ref(db, `users/${uid}/played`);
    const ratingsRef = ref(db, 'userRatings');
    const ratingsQuery = query(ratingsRef, orderByChild('user_id'), equalTo(uid));

    const handleWishlist = (snap) => {
      const val = snap.exists() ? snap.val() : null;
      setWishlistCount(val ? Object.keys(val).length : 0);
    };
    const handlePlayed = (snap) => {
      const val = snap.exists() ? snap.val() : null;
      setPlayedCount(val ? Object.keys(val).length : 0);
    };
    const handleRatings = (snap) => {
      const val = snap.exists() ? snap.val() : null;
      setRatingsCount(val ? Object.keys(val).length : 0);
    };

    onValue(wishlistRef, handleWishlist);
    onValue(playedRef, handlePlayed);
    onValue(ratingsQuery, handleRatings);

    return () => {
      off(wishlistRef, 'value', handleWishlist);
      off(playedRef, 'value', handlePlayed);
      off(ratingsQuery, 'value', handleRatings);
    };
  }, [user?.uid]);

  // Dynamiske stats
  const stats = [
    { label: 'Ratings', value: ratingsCount },
    { label: 'Played', value: playedCount },
    { label: 'Wishlist', value: wishlistCount },
  ];

  return (
    <View style={styles.profileContainer}>
       {/* ScrollView så siden kan udvides med mere indhold uden overflow */}
      <ScrollView style={styles.profileScroll} contentContainerStyle={styles.profileScrollContent}>
        {/* Header sektion med logo og email */}
        <View style={styles.profileHeader}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.userEmail}>{displayName}</Text>
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
