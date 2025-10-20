import React, { useState } from 'react';
import { View, Button, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useAuth } from '../components/Auth';
import { styles } from '../styles/styles';



export default function LoginScreen({ navigation }) {
  const { login, error, loadingAction } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    // Wrapper så tastatur lukkes når man trykker udenfor felter
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign In</Text>

        {/* Email */}
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail} // Opdater state ved input
          mode="outlined"
          style={styles.input} // Bevarer konsistent styling
          textColor="#eeeaeaff"
          placeholderTextColor="#fcf7f7ff"
          outlineColor="#818181ff"
          activeOutlineColor="#cbcbccff"
          cursorColor="#f1f1fcff"
          selectionColor="#fffbfbff"
          autoComplete="email" // Hjælp til autofill
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
          cursorColor="#f1f1fcff"
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

        {/* Login knap */}
        <View style={styles.buttonWrapper}>
          <Button
            title={loadingAction ? 'Signing in...' : 'Sign In'}
            color="#ffffffff"
            onPress={() => login({ email, password })}
            disabled={!email || !password || loadingAction}
          />
        </View>

        {error ? (
          <Text style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center', fontSize: 12 }}>{error}</Text>
        ) : null}
        
        {/* Link til signup skærm */}
        <TouchableOpacity onPress={() => navigation?.navigate?.('Signup')} activeOpacity={0.7}>
          <Text style={styles.linkText}>Don't have an account? Create one</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
