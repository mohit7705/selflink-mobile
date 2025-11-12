import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { navigateToUserProfile } from '@navigation/helpers';
import {
  selectIsLoadingThreads,
  selectMessagingError,
  selectThreads,
  useMessagingStore,
} from '@store/messagingStore';
import { useAuthStore } from '@store/authStore';
import type { Thread } from '@schemas/messaging';

export function ThreadsScreen() {
  const navigation = useNavigation<any>();
  const threads = useMessagingStore(selectThreads);
  const isLoading = useMessagingStore(selectIsLoadingThreads);
  const error = useMessagingStore(selectMessagingError);
  const loadThreads = useMessagingStore((state) => state.loadThreads);
  const currentUserId = useAuthStore((state) => state.currentUser?.id);

  useEffect(() => {
    loadThreads().catch(() => undefined);
  }, [loadThreads]);

  const openProfile = useCallback(
    (userId: number) => {
      navigateToUserProfile(navigation, userId);
    },
    [navigation],
  );

  const renderThread = useCallback(
    ({ item }: { item: Thread }) => {
      const otherUser =
        currentUserId != null
          ? item.participants?.find((participant) => participant.id !== currentUserId)
          : undefined;
      const title = otherUser?.name || otherUser?.handle || item.title || 'Conversation';
      const preview = item.last_message?.body ?? 'No messages yet.';
      const isUnread = (item.unread_count ?? 0) > 0;
      return (
        <View>
          <TouchableOpacity
            style={styles.thread}
            onPress={() => navigation.navigate('Chat', { threadId: item.id, otherUserId: otherUser?.id })}
          >
            <View style={styles.threadHeader}>
              <Text style={styles.threadTitle}>{title}</Text>
              {isUnread ? (
                <View style={styles.unreadPill}>
                  <Text style={styles.unreadText}>{Math.min(item.unread_count ?? 0, 99)}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.threadPreview, isUnread && styles.threadPreviewUnread]} numberOfLines={1}>
              {preview}
            </Text>
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
    },
    [currentUserId, navigation, openProfile],
  );

  const keyExtractor = useCallback((item: Thread) => String(item.id), []);

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
      keyExtractor={keyExtractor}
      renderItem={renderThread}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={isLoading && threads.length > 0}
          onRefresh={() => {
            loadThreads().catch(() => undefined);
          }}
        />
      }
      ListEmptyComponent={
        !isLoading ? (
          <View style={styles.centered}>
            <Text>No conversations yet.</Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16 },
  thread: { paddingVertical: 12 },
  threadTitle: { fontWeight: '600', marginBottom: 4 },
  threadPreview: { color: '#475569' },
  threadPreviewUnread: { fontWeight: '600', color: '#0f172a' },
  threadHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  unreadPill: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  unreadText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  profileLink: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  profileLinkText: { color: '#2563EB' },
  separator: { height: 1, backgroundColor: '#E2E8F0' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
