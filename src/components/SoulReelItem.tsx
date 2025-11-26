import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

import { VideoPostPlayer } from '@components/VideoPostPlayer';
import type { Post } from '@schemas/social';

type Props = {
  post: Post;
  isActive: boolean;
  onLike?: (postId: string | number) => void;
  onComment?: (postId: string | number) => void;
  onShare?: (postId: string | number) => void;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function SoulReelItemComponent({ post, isActive, onLike, onComment, onShare }: Props) {
  return (
    <View style={[styles.container, { height: SCREEN_HEIGHT }]}>
      {post.video ? (
        <VideoPostPlayer source={post.video} isActive={isActive} mode="reel" />
      ) : null}
      <View style={styles.overlay}>
        <View style={styles.caption}>
          <Text style={styles.author}>{post.author?.name ?? 'SelfLink user'}</Text>
          {post.text ? (
            <Text style={styles.text} numberOfLines={2}>
              {post.text}
            </Text>
          ) : null}
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={() => onLike?.(post.id)}
            style={styles.actionButton}
            accessibilityLabel="Like reel"
          >
            <Ionicons name="heart" size={26} color="#F472B6" />
            <Text style={styles.actionLabel}>{post.like_count}</Text>
          </Pressable>
          <Pressable
            onPress={() => onComment?.(post.id)}
            style={styles.actionButton}
            accessibilityLabel="Comment reel"
          >
            <Ionicons name="chatbubble-ellipses" size={26} color="#E2E8F0" />
            <Text style={styles.actionLabel}>{post.comment_count}</Text>
          </Pressable>
          <Pressable
            onPress={() => onShare?.(post.id)}
            style={styles.actionButton}
            accessibilityLabel="Share reel"
          >
            <Ionicons name="arrow-redo" size={24} color="#E2E8F0" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const SoulReelItem = memo(SoulReelItemComponent);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  caption: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  author: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 16,
  },
  text: {
    color: '#E2E8F0',
    fontSize: 14,
  },
  actions: {
    gap: 18,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
});
