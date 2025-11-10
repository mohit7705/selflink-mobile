import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Post } from '@schemas/social';

import { UserAvatar } from './UserAvatar';

type Props = {
  post: Post;
  onPress?: (post: Post) => void;
  onLikePress?: (post: Post) => void;
};

function Component({ post, onPress, onLikePress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={() => onPress?.(post)}>
      <View style={styles.header}>
        <UserAvatar uri={post.author.photo} label={post.author.name} size={40} />
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
    </TouchableOpacity>
  );
}

export const FeedPostCard = memo(Component);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  meta: {
    flex: 1,
  },
  author: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  handle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  timestamp: {
    color: '#94A3B8',
    fontSize: 11,
  },
  content: {
    color: '#E5E7EB',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    color: '#94A3B8',
    fontSize: 12,
  },
  likeButton: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  likeButtonActive: {
    color: '#F472B6',
  },
});
