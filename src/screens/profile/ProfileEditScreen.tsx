import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MetalButton } from '@components/MetalButton';
import { MetalPanel } from '@components/MetalPanel';
import { useToast } from '@context/ToastContext';
import { updateMyProfile } from '@api/users';
import { useAuthStore } from '@store/authStore';
import { ProfileStackParamList } from '@navigation/types';
import { theme } from '@theme/index';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileEdit'>;

export function ProfileEditScreen() {
  const navigation = useNavigation<Nav>();
  const currentUser = useAuthStore((state) => state.currentUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const toast = useToast();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [locale, setLocale] = useState(currentUser?.locale ?? '');
  const [birthPlace, setBirthPlace] = useState(currentUser?.birth_place ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        name: name || undefined,
        bio: bio || undefined,
        locale: locale || undefined,
        birth_place: birthPlace || undefined,
      });
      setCurrentUser(updated);
      toast.push({ message: 'Profile updated', tone: 'info', duration: 3000 });
      navigation.goBack();
    } catch (error) {
      console.error('ProfileEditScreen: update failed', error);
      toast.push({ message: 'Could not update profile. Try again.', tone: 'error', duration: 5000 });
    } finally {
      setSaving(false);
    }
  }, [bio, birthPlace, locale, name, navigation, saving, setCurrentUser, toast]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <MetalPanel glow>
            <TextInput
              placeholder="Name"
              placeholderTextColor={theme.palette.silver}
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Bio"
              placeholderTextColor={theme.palette.silver}
              value={bio}
              onChangeText={setBio}
              style={[styles.input, styles.multiline]}
              multiline
              numberOfLines={3}
            />
            <TextInput
              placeholder="Locale (e.g., en-US)"
              placeholderTextColor={theme.palette.silver}
              value={locale}
              onChangeText={setLocale}
              style={styles.input}
            />
            <TextInput
              placeholder="Birth place"
              placeholderTextColor={theme.palette.silver}
              value={birthPlace}
              onChangeText={setBirthPlace}
              style={styles.input}
            />
            <View style={styles.actions}>
              <MetalButton title="Cancel" onPress={() => navigation.goBack()} />
              <MetalButton
                title={saving ? 'Saving…' : 'Save'}
                onPress={handleSave}
                disabled={saving}
              />
            </View>
          </MetalPanel>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.palette.midnight,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  input: {
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.palette.pearl,
    color: theme.palette.titanium,
    marginBottom: theme.spacing.sm,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
});
