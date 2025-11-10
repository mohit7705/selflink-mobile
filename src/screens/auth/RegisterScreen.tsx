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

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export function RegisterScreen() {
  const navigation = useNavigation<Navigation>();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isAuthenticating, error, setError } = useAuthStore((state) => ({
    register: state.register,
    isAuthenticating: state.isAuthenticating,
    error: state.error,
    setError: state.setError,
  }));

  const handleSubmit = useCallback(async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing info', 'Please fill all required fields.');
      return;
    }
    try {
      await register({ email, password, name, handle: handle || undefined });
    } catch (err) {
      console.warn('register failed', err);
    }
  }, [register, name, email, password, handle]);

  const handleNavigateLogin = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Create your account</Text>
        <TextInput
          placeholder="Full name"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (error) {
              setError(null);
            }
          }}
        />
        <TextInput
          placeholder="Handle"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          style={styles.input}
          value={handle}
          onChangeText={(text) => {
            setHandle(text);
            if (error) {
              setError(null);
            }
          }}
        />
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
          <Text style={styles.buttonLabel}>{isAuthenticating ? 'Creating…' : 'Create account'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerLink} onPress={handleNavigateLogin}>
          <Text style={styles.footerText}>Already have an account? Sign in</Text>
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
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    color: '#F8FAFC',
  },
  button: {
    backgroundColor: '#22D3EE',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#F87171',
    textAlign: 'center',
  },
  footerLink: {
    alignItems: 'center',
  },
  footerText: {
    color: '#C084FC',
    fontWeight: '600',
  },
});
