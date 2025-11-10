import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useMessagingStore } from '@store/messagingStore';

export function ThreadsScreen() {
  const navigation = useNavigation<any>();
  const threads = useMessagingStore((state) => state.threads);
  const isLoading = useMessagingStore((state) => state.isLoadingThreads);
  const error = useMessagingStore((state) => state.error);
  const loadThreads = useMessagingStore((state) => state.loadThreads);

  useEffect(() => {
    loadThreads().catch(() => undefined);
  }, [loadThreads]);

  if (isLoading && threads.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error && threads.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={threads}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.thread}
          onPress={() => navigation.navigate('Chat', { threadId: item.id })}
        >
          <Text style={styles.threadTitle}>{item.title || 'Direct message'}</Text>
          {item.last_message?.body ? (
            <Text style={styles.threadPreview}>{item.last_message.body}</Text>
          ) : (
            <Text style={styles.threadPreview}>No messages yet.</Text>
          )}
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  thread: {
    paddingVertical: 12,
  },
  threadTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  threadPreview: {
    color: '#475569',
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
