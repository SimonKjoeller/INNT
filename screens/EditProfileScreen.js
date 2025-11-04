import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { styles } from '../styles/styles';
import { useAuth } from '../components/Auth';
import { auth, db } from '../database/firebase';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { ref as dbRef, get, set, update, remove } from 'firebase/database';
// Edit Profile (without avatar upload for now)

export default function EditProfileScreen({ navigation }) {
  const { user, profile, username } = useAuth();
  const currentUsername = useMemo(() => profile?.username || username || user?.displayName || '', [profile, username, user]);
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const uid = user.uid;
      let updates = {};

      // 1) Handle username change with uniqueness in RTDB
      const desired = (newUsername || '').trim().toLowerCase();
      const current = (currentUsername || '').trim().toLowerCase();
      if (desired && desired !== current) {
        const uRef = dbRef(db, `usernames/${desired}`);
        const snap = await get(uRef);
        const takenBy = snap.exists() ? snap.val()?.uid : null;
        if (takenBy && takenBy !== uid) {
          throw new Error('Username is already taken.');
        }
        // reserve new
        await set(uRef, { uid, updatedAt: Date.now() });
        // remove old reservation and usersByUsername doc
        if (current) {
          await remove(dbRef(db, `usernames/${current}`));
          await remove(dbRef(db, `usersByUsername/${current}`));
        }
        // update usersByUsername and users
        const profilePatch = {
          uid,
          email: email || user.email,
          username: desired,
          displayName: desired,
          updatedAt: Date.now(),
        };
        await set(dbRef(db, `usersByUsername/${desired}`), profilePatch);
        updates[`users/${uid}/username`] = desired;
        updates[`users/${uid}/displayName`] = desired;
        // update auth displayName
        await updateProfile(user, { displayName: desired });
      }

      // 2) Handle email change
      if (email && email !== user.email) {
        await updateEmail(user, email);
        updates[`users/${uid}/email`] = email;
      }

      // 3) Handle password change
      if (password && password.length >= 6) {
        await updatePassword(user, password);
      }

      if (Object.keys(updates).length > 0) {
        await update(dbRef(db), updates);
      }

      Alert.alert('Profile updated', 'Your profile changes have been saved.');
      navigation.goBack();
    } catch (e) {
      if (e?.code === 'auth/requires-recent-login') {
        Alert.alert('Please re-login', 'For security reasons, please log in again to change email or password.');
      } else {
        Alert.alert('Update failed', e.message || 'Something went wrong.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.profileContainer]}> 
      <ScrollView style={styles.profileScroll} contentContainerStyle={[styles.profileScrollContent, { paddingBottom: 32 }]}> 
        <Text style={styles.title}>Edit Profile</Text>

        {/* Username */}
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#9aa0a6"
          autoCapitalize="none"
          value={newUsername}
          onChangeText={setNewUsername}
        />

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9aa0a6"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password */}
        <TextInput
          style={styles.input}
          placeholder="New Password (min 6 chars)"
          placeholderTextColor="#9aa0a6"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.actionButton, { marginTop: 8 }]}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
