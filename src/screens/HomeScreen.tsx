import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import {
  Image,
  ImageStyle,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MetalButton } from '@components/MetalButton';
import { MetalPanel } from '@components/MetalPanel';
import { theme } from '@theme/index';

export function HomeScreen() {
  const handleMentorPress = useCallback(() => {
    // placeholder
  }, []);

  const handleSoulMatchPress = useCallback(() => {
    // placeholder
  }, []);

  const handlePaymentsPress = useCallback(() => {
    // placeholder
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headline}>Selflink</Text>
          <Text style={styles.subhead}>
            Think Different. Connect deeper. Your mentor, community, and soul matches in
            one luminous space.
          </Text>
        </View>

        <MetalPanel glow>
          <Text style={styles.panelTitle}>Today&apos;s Journey</Text>
          <View style={styles.buttonRow}>
            <MetalButton title="Mentor Session" onPress={handleMentorPress} />
            <MetalButton title="SoulMatch" onPress={handleSoulMatchPress} />
            <MetalButton title="Payments" onPress={handlePaymentsPress} />
          </View>
        </MetalPanel>
      </ScrollView>
    </SafeAreaView>
  );
}

type Styles = {
  safeArea: ViewStyle;
  content: ViewStyle;
  hero: ViewStyle;
  logo: ImageStyle;
  headline: TextStyle;
  subhead: TextStyle;
  panelTitle: TextStyle;
  buttonRow: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
  safeArea: {
    flex: 1,
    backgroundColor: theme.palette.midnight,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  logo: {
    height: 68,
    width: 68,
  },
  headline: {
    color: theme.palette.platinum,
    ...theme.typography.title,
  },
  subhead: {
    color: theme.palette.silver,
    textAlign: 'center',
    ...theme.typography.body,
  },
  panelTitle: {
    color: theme.palette.titanium,
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  buttonRow: {
    gap: theme.spacing.sm,
  },
});
