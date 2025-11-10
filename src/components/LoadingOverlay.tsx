import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type Props = {
  label?: string;
};

export function LoadingOverlay({ label }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
