import React, { useState } from 'react';
import { View, Text, Button, Keyboard, TouchableWithoutFeedback, Alert, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useAuth } from '../components/Auth';
import { styles } from '../styles/styles';



export default function SignupScreen({ navigation }) {
  // Henter signup funktionen fra Auth i component/Auth.js
  const { signup, error, loadingAction } = useAuth();
// Lokale state variabler til formularens inputfelter
  const [email, setEmail] = useState(''); // Brugerens email
  const [password, setPassword] = useState(''); // Brugerens valgte adgangskode
  const [confirmPassword, setConfirmPassword] = useState(''); // Bekræftelse af adgangskode
  const [showPassword, setShowPassword] = useState(false); // Toggle for visning af adgangskode
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle for visning af bekræftelsesadgangskode
  const [loading, setLoading] = useState(false); 

  // Simpel validering: alle felter skal være udfyldt (trim fjerner mellemrum i kanterne)
  const allFilled = email.trim() && password.trim() && confirmPassword.trim();

  // Funktion der køres når brugeren trykker "Opret konto"
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
    // Wrapper der fjerner tastaturet når man trykker udenfor inputfelter
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        {/* Email */}
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail} // Opdater state ved input
          mode="outlined"
          style={styles.input}
          textColor="#eeeaeaff"
          autoCapitalize="none" // Forhindrer at første bogstav bliver stort
          autoComplete="email"
          keyboardType="email-address" // Viser email-optimeret tastatur
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
          secureTextEntry={!showPassword} // Skjul eller vis tekst
          right={( // Ikon i højre side af feltet til at toggle visning
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(p => !p)}
            />
          )}
          textContentType="oneTimeCode" // Forhindrer iOS i at foreslå "stærk adgangskode"
          autoComplete="off"
          importantForAutofill="no"
          theme={{
            colors: {
              primary: '#520f0fff',
              onSurfaceVariant: '#ceced1ff',
            },
          }}
        />

        {/* Bekræft Password */}
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
        {/* Knappen vises kun når alle felter er udfyldt */}
        {allFilled ? (
          <View style={styles.buttonWrapper}>
            <Button
              title={loadingAction || loading ? 'Creating...' : 'Create Account'} // Skifter tekst når loading
              onPress={handleSignup}
              color="#f1f1f3ff"
              disabled={loadingAction || loading}
            />
          </View>
        ) : null}

        {error ? (
          <Text style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center', fontSize: 12 }}>{error}</Text>
        ) : null}
        {/* Link til login skærm */}
        <TouchableOpacity onPress={() => navigation?.navigate?.('Login')} activeOpacity={0.7}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
