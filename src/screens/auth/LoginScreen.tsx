import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthStore } from '@store/authStore';
import type { AuthStackParamList } from '@navigation/types';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Navigation>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticating, error, setError } = useAuthStore((state) => ({
    login: state.login,
    isAuthenticating: state.isAuthenticating,
    error: state.error,
    setError: state.setError,
  }));

  const handleSubmit = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    try {
      await login({ email, password });
    } catch (err) {
      console.warn('login failed', err);
    }
  }, [email, password, login]);

  const handleNavigateRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue to SelfLink</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) {
              setError(null);
            }
          }}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) {
              setError(null);
            }
          }}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isAuthenticating}>
          <Text style={styles.buttonLabel}>{isAuthenticating ? 'Signing in…' : 'Sign in'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerLink} onPress={handleNavigateRegister}>
          <Text style={styles.footerText}>Need an account? Create one</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#020617',
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94A3B8',
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    color: '#F8FAFC',
  },
  button: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#F87171',
    textAlign: 'center',
  },
  footerLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#C084FC',
    fontWeight: '600',
  },
});
