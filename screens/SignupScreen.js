import React, { useState } from 'react';
import { View, Text, Button, Keyboard, TouchableWithoutFeedback, Alert, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useAuth } from '../components/Auth';
import { styles } from '../styles/styles';

// Using shared styles from styles/styles.js

export default function SignupScreen({ navigation }) {
  const { signup, error, loadingAction } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const allFilled = email.trim() && password.trim() && confirmPassword.trim();

  const handleSignup = async () => {
    if (!allFilled) return;
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please make sure both passwords are identical.');
      return;
    }
    setLoading(true);
    try {
      await signup({ email, password });
    } catch (e) {
      // error handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        {/* Email */}
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          textColor="#eeeaeaff"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholderTextColor="#fcf7f7ff"
          outlineColor="#818181ff"
          activeOutlineColor="#cbcbccff"
          selectionColor="#fffbfbff"
          textContentType="emailAddress"
          importantForAutofill="yes"
          theme={{
            colors: {
              primary: '#520f0fff',
              onSurfaceVariant: '#ceced1ff',
            },
          }}
        />

        {/* Password */}
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          textColor="#eeeaeaff"
          placeholderTextColor="#fcf7f7ff"
          outlineColor="#818181ff"
          activeOutlineColor="#cbcbccff"
          selectionColor="#fffbfbff"
          secureTextEntry={!showPassword}
          right={(
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(p => !p)}
            />
          )}
          textContentType="oneTimeCode"
          autoComplete="off"
          importantForAutofill="no"
          theme={{
            colors: {
              primary: '#520f0fff',
              onSurfaceVariant: '#ceced1ff',
            },
          }}
        />

        {/* Confirm Password */}
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          style={styles.input}
          textColor="#eeeaeaff"
          placeholderTextColor="#fcf7f7ff"
          outlineColor="#818181ff"
          activeOutlineColor="#cbcbccff"
          selectionColor="#fffbfbff"
          secureTextEntry={!showConfirmPassword}
          right={(
            <TextInput.Icon
              icon={showConfirmPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowConfirmPassword(p => !p)}
            />
          )}
          textContentType="oneTimeCode"
          autoComplete="off"
          importantForAutofill="no"
          theme={{
            colors: {
              primary: '#520f0fff',
              onSurfaceVariant: '#ceced1ff',
            },
          }}
        />

        {allFilled ? (
          <View style={styles.buttonWrapper}>
            <Button
              title={loadingAction || loading ? 'Creating...' : 'Create Account'}
              onPress={handleSignup}
              color="#f1f1f3ff"
              disabled={loadingAction || loading}
            />
          </View>
        ) : null}

        {error ? (
          <Text style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center', fontSize: 12 }}>{error}</Text>
        ) : null}

        <TouchableOpacity onPress={() => navigation?.navigate?.('Login')} activeOpacity={0.7}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
