import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getFeed, likePost, unlikePost } from '@api/social';
import { FeedPostCard } from '@components/FeedPostCard';
import { ErrorState } from '@components/ErrorState';
import { LoadingOverlay } from '@components/LoadingOverlay';
import { theme } from '@theme';
import { Post, TimelineEntry } from '@schemas/social';

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
    <LinearGradient colors={theme.gradients.appBackground} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={timeline}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>SelfLink Feed</Text>
              <Text style={styles.headerSubtitle}>
                Cosmic threads, mentor updates, and constellation moments from your network.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <FeedPostCard post={item.post} onLikePress={handleLikeToggle} />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
        <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
          <LinearGradient colors={theme.gradients.cta} style={styles.fabInner}>
            <Text style={styles.fabLabel}>New Post</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: {
    color: theme.text.primary,
    ...theme.typography.headingL,
  },
  headerSubtitle: {
    color: theme.text.secondary,
    marginTop: theme.spacing.sm,
    ...theme.typography.body,
  },
  listContent: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  separator: {
    height: theme.spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.xl,
    bottom: theme.spacing.xl,
    borderRadius: theme.radii.pill,
    ...theme.shadows.button,
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.pill,
  },
  fabLabel: {
    color: theme.text.primary,
    ...theme.typography.button,
  },
});
