import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '@theme/index';

type Props = {
  children: ReactNode;
  glow?: boolean;
  style?: ViewStyle;
};

export function MetalPanel({ children, glow = false, style }: Props) {
  return (
    <LinearGradient
      colors={theme.gradients.panel}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, glow && styles.glow, style]}
    >
      <View style={styles.inner}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.panel,
  },
  inner: {
    borderRadius: theme.radius.md,
  },
  glow: {
    borderWidth: 1,
    borderColor: theme.palette.glow,
  },
});
