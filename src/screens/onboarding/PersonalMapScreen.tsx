import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuthStore } from '@store/authStore';

const initialFormState = {
  first_name: '',
  last_name: '',
  birth_date: '',
  birth_time: '',
  birth_place_country: '',
  birth_place_city: '',
};

type FormState = typeof initialFormState;

export function PersonalMapScreen() {
  const { personalMap, savePersonalMap } = useAuthStore((state) => ({
    personalMap: state.personalMap,
    savePersonalMap: state.savePersonalMap,
  }));
  const [form, setForm] = useState<FormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (personalMap) {
      setForm({
        first_name: personalMap.first_name ?? '',
        last_name: personalMap.last_name ?? '',
        birth_date: personalMap.birth_date ?? '',
        birth_time: personalMap.birth_time ?? '',
        birth_place_country: personalMap.birth_place_country ?? '',
        birth_place_city: personalMap.birth_place_city ?? '',
      });
    }
  }, [personalMap]);

  const isValid = useMemo(() => {
    return (
      form.first_name.trim().length > 0 &&
      form.last_name.trim().length > 0 &&
      form.birth_date.trim().length > 0 &&
      form.birth_place_country.trim().length > 0 &&
      form.birth_place_city.trim().length > 0
    );
  }, [form]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('One more step', 'Please fill out all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await savePersonalMap({
        ...form,
        birth_time: form.birth_time.trim() ? form.birth_time : null,
      });
      Alert.alert('Profile updated', 'Your personal map is complete.');
    } catch (error) {
      console.warn('personal map save failed', error);
      Alert.alert('Error', 'We were unable to save your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Personal Map</Text>
        <Text style={styles.subtitle}>Tell us more so we can personalize your experience.</Text>
        <Input
          label="First name"
          value={form.first_name}
          onChangeText={(text) => handleChange('first_name', text)}
          required
        />
        <Input
          label="Last name"
          value={form.last_name}
          onChangeText={(text) => handleChange('last_name', text)}
          required
        />
        <Input
          label="Birth date (YYYY-MM-DD)"
          value={form.birth_date}
          onChangeText={(text) => handleChange('birth_date', text)}
          required
        />
        <Input
          label="Birth time (HH:MM)"
          value={form.birth_time ?? ''}
          onChangeText={(text) => handleChange('birth_time', text)}
        />
        <Input
          label="Birth country"
          value={form.birth_place_country}
          onChangeText={(text) => handleChange('birth_place_country', text)}
          required
        />
        <Input
          label="Birth city"
          value={form.birth_place_city}
          onChangeText={(text) => handleChange('birth_place_city', text)}
          required
        />
        <TouchableOpacity
          style={[styles.button, (!isValid || submitting) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || submitting}
        >
          <Text style={styles.buttonLabel}>{submitting ? 'Saving…' : 'Save and continue'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
};

function Input({ label, value, onChangeText, required }: InputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#64748B"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  subtitle: {
    color: '#94A3B8',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: '#E2E8F0',
    fontWeight: '500',
  },
  required: {
    color: '#F87171',
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    color: '#F8FAFC',
  },
  button: {
    backgroundColor: '#22D3EE',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: '#0F172A',
  },
});
