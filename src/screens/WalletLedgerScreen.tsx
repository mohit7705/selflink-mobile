import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MetalPanel } from '@components/MetalPanel';
import { theme } from '@theme/index';

export function WalletLedgerScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headline}>Wallet Ledger</Text>
        <MetalPanel>
          <Text style={styles.body}>
            Ledger details will appear here once the wallet API is connected.
          </Text>
        </MetalPanel>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.palette.midnight,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  headline: {
    ...theme.typography.title,
    color: theme.palette.platinum,
  },
  body: {
    ...theme.typography.body,
    color: theme.palette.platinum,
  },
});
