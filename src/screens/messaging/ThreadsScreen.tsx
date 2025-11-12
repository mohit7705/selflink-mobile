import { useCallback, useEffect } from 'react';
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
import { useAuthStore } from '@store/authStore';
import type { Thread } from '@schemas/messaging';

export function ThreadsScreen() {
  const navigation = useNavigation<any>();
  const threads = useMessagingStore((state) => state.threads);
  const isLoading = useMessagingStore((state) => state.isLoadingThreads);
  const error = useMessagingStore((state) => state.error);
  const loadThreads = useMessagingStore((state) => state.loadThreads);
  const currentUserId = useAuthStore((state) => state.currentUser?.id);

  useEffect(() => {
    loadThreads().catch(() => undefined);
  }, [loadThreads]);

  const openProfile = useCallback(
    (userId: number) => {
      navigation.navigate(
        'Profile' as never,
        {
          screen: 'UserProfile',
          params: { userId },
        } as never,
      );
    },
    [navigation],
  );

  const renderThread = (thread: Thread) => {
    const otherUser =
      currentUserId != null
        ? thread.participants?.find((participant) => participant.id !== currentUserId)
        : undefined;
    const title = otherUser?.name || otherUser?.handle || thread.title || 'Conversation';

    return (
      <View>
        <TouchableOpacity
          style={styles.thread}
          onPress={() => navigation.navigate('Chat', { threadId: thread.id, otherUserId: otherUser?.id })}
        >
          <Text style={styles.threadTitle}>{title}</Text>
          {thread.last_message?.body ? (
            <Text style={styles.threadPreview}>{thread.last_message.body}</Text>
          ) : (
            <Text style={styles.threadPreview}>No messages yet.</Text>
          )}
        </TouchableOpacity>
        {otherUser ? (
          <TouchableOpacity
            style={styles.profileLink}
            onPress={() => openProfile(otherUser.id)}
          >
            <Text style={styles.profileLinkText}>View profile</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

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
      renderItem={({ item }) => renderThread(item)}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16 },
  thread: { paddingVertical: 12 },
  threadTitle: { fontWeight: '600', marginBottom: 4 },
  threadPreview: { color: '#475569' },
  profileLink: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  profileLinkText: { color: '#2563EB' },
  separator: { height: 1, backgroundColor: '#E2E8F0' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
