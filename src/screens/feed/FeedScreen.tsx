import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FeedPostCard } from '@components/FeedPostCard';
import { useFeedStore } from '@store/feedStore';

export function FeedScreen() {
  const posts = useFeedStore((state) => state.posts);
  const isLoading = useFeedStore((state) => state.isLoading);
  const error = useFeedStore((state) => state.error);
  const loadFeed = useFeedStore((state) => state.loadFeed);
  const loadMore = useFeedStore((state) => state.loadMore);

  useEffect(() => {
    loadFeed().catch(() => undefined);
  }, [loadFeed]);

  if (isLoading && posts.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error && posts.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <FeedPostCard post={item} />}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl refreshing={isLoading && posts.length > 0} onRefresh={loadFeed} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={
        !isLoading ? (
          <View style={styles.centered}>
            <Text>No posts yet.</Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});
