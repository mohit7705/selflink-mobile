import { useEffect, useLayoutEffect, useMemo } from 'react';
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

import { FeedPostCard } from '@components/FeedPostCard';
import { useFeedStore } from '@store/feedStore';

export function FeedScreen() {
  const navigation = useNavigation<any>();
  const posts = useFeedStore((state) => state.posts);
  const isLoading = useFeedStore((state) => state.isLoading);
  const error = useFeedStore((state) => state.error);
  const loadFeed = useFeedStore((state) => state.loadFeed);
  const loadMore = useFeedStore((state) => state.loadMore);
  const showFab = useMemo(() => posts.length > 0, [posts.length]);

  useEffect(() => {
    loadFeed().catch(() => undefined);
  }, [loadFeed]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('SearchProfiles')}>
          <Text style={styles.headerAction}>Search</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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

  const renderEmpty = () =>
    !isLoading ? (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No posts yet</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.primaryButtonLabel}>Create your first post</Text>
        </TouchableOpacity>
      </View>
    ) : null;

  return (
    <View style={{ flex: 1 }}>
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
        ListEmptyComponent={renderEmpty}
      />
      {showFab ? (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      ) : null}
    </View>
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  primaryButtonLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    marginTop: -2,
  },
  headerAction: {
    marginRight: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
});
