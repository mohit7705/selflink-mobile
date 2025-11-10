import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Post } from '@schemas/social';
import { theme } from '@theme';

import { UserAvatar } from './UserAvatar';

type Props = {
  post: Post;
  onPress?: (post: Post) => void;
  onLikePress?: (post: Post) => void;
};

function Component({ post, onPress, onLikePress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.92} onPress={() => onPress?.(post)}>
      <LinearGradient colors={theme.gradients.card} style={styles.card}>
        <View style={styles.header}>
          <UserAvatar uri={post.author.photo} label={post.author.name} size={42} />
          <View style={styles.meta}>
            <Text style={styles.author}>{post.author.name}</Text>
            <Text style={styles.handle}>@{post.author.handle}</Text>
          </View>
          <Text style={styles.timestamp}>{new Date(post.created_at).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.content}>{post.text}</Text>
        <View style={styles.footer}>
          <Text style={styles.stat}>{post.like_count} likes</Text>
          <Text style={styles.stat}>{post.comment_count} comments</Text>
          <TouchableOpacity onPress={() => onLikePress?.(post)}>
            <Text style={[styles.likeButton, post.liked && styles.likeButtonActive]}>
              {post.liked ? 'Unlike' : 'Like'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export const FeedPostCard = memo(Component);

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  meta: {
    flex: 1,
  },
  author: {
    color: theme.text.primary,
    fontWeight: '600',
  },
  handle: {
    color: theme.text.muted,
    fontSize: 12,
  },
  timestamp: {
    color: theme.text.muted,
    fontSize: 11,
  },
  content: {
    color: theme.text.primary,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    color: theme.text.secondary,
    fontSize: 12,
  },
  likeButton: {
    color: theme.text.secondary,
    fontWeight: '600',
  },
  likeButtonActive: {
    color: theme.colors.secondary,
  },
});
