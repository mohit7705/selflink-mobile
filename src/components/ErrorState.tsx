import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message = 'Something went wrong.', onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryLabel}>Try again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#EF4444',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1F2937',
  },
  retryLabel: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
});
