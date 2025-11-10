import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { getFeed, likePost, unlikePost } from '@api/social';
import { FeedPostCard } from '@components/FeedPostCard';
import { ErrorState } from '@components/ErrorState';
import { LoadingOverlay } from '@components/LoadingOverlay';
import { Post, TimelineEntry } from '@types/social';

export function FeedScreen() {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getFeed();
      setTimeline(data);
    } catch (err) {
      console.warn('feed load failed', err);
      setError('Unable to load your feed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed().catch(() => undefined);
  }, [loadFeed]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getFeed();
      setTimeline(data);
    } catch (err) {
      console.warn('feed refresh failed', err);
      setError('Unable to refresh feed.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLikeToggle = useCallback(async (post: Post) => {
    setTimeline((prev) =>
      prev.map((entry) =>
        entry.post.id === post.id
          ? {
              ...entry,
              post: {
                ...entry.post,
                liked: !post.liked,
                like_count: Math.max(0, entry.post.like_count + (post.liked ? -1 : 1)),
              },
            }
          : entry,
      ),
    );
    try {
      if (post.liked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (error) {
      console.warn('like toggle failed', error);
      await loadFeed();
    }
  }, [loadFeed]);

  if (loading) {
    return <LoadingOverlay label="Loading your feed" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadFeed} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={timeline}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <FeedPostCard post={item.post} onLikePress={handleLikeToggle} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  separator: {
    height: 16,
  },
});
