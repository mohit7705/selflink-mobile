import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable as RNPressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { followUser, unfollowUser } from '@api/users';
import { PostContent } from '@components/PostContent';
import { usePulseAnimation } from '@hooks/usePulseAnimation';
import type { Post } from '@schemas/social';
import { useAuthStore } from '@store/authStore';
import { useFeedStore } from '@store/feedStore';
import { theme } from '@theme';

import { UserAvatar } from './UserAvatar';
import { useEntranceAnimation, usePressScaleAnimation } from '../styles/animations';

interface Props {
  post: Post;
  shouldPlayVideo?: boolean;
  isFeedFocused?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

function FeedPostCardComponent({ post, shouldPlayVideo = false, isFeedFocused }: Props) {
  const navigation = useNavigation<any>();
  const currentUserId = useAuthStore((state) => state.currentUser?.id);
  const likePost = useFeedStore((state) => state.likePost);
  const unlikePost = useFeedStore((state) => state.unlikePost);
  const entrance = useEntranceAnimation();
  const pressAnim = usePressScaleAnimation(0.985);
  const likePress = usePressScaleAnimation(0.96);
  const commentPress = usePressScaleAnimation(0.96);
  const heartScale = useRef(new Animated.Value(0)).current;
  const [pulseKey, setPulseKey] = useState(0);
  const [followPending, setFollowPending] = useState(false);
  const [likePending, setLikePending] = useState(false);
  const pulse = usePulseAnimation(pulseKey);
  const [isFollowing, setIsFollowing] = useState(() => {
    if ((post.author as any).is_following !== undefined) {
      return Boolean((post.author as any).is_following);
    }
    const flags = post.author.flags as Record<string, unknown> | undefined;
    if (!flags) {
      return false;
    }
    return Boolean(flags.following || flags.is_following);
  });

  const handleLikeToggle = useCallback(async () => {
    if (likePending) {
      return;
    }
    setLikePending(true);
    try {
      if (post.liked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
        setPulseKey((k) => k + 1);
      }
    } catch (error) {
      console.warn('FeedPostCard: like toggle failed', error);
      Alert.alert('Unable to update like', 'Please try again.');
    } finally {
      setLikePending(false);
    }
  }, [likePending, likePost, unlikePost, post.id, post.liked]);

  const handleFollowToggle = useCallback(async () => {
    if (followPending || post.author.id === currentUserId) {
      return;
    }
    setFollowPending(true);
    try {
      if (isFollowing) {
        await unfollowUser(post.author.id);
        setIsFollowing(false);
      } else {
        await followUser(post.author.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.warn('FeedPostCard: follow toggle failed', error);
    } finally {
      setFollowPending(false);
    }
  }, [currentUserId, isFollowing, post.author.id, followPending]);

  const lastTap = useRef(0);
  const previousLikedRef = useRef(post.liked);
  useEffect(() => {
    if (!previousLikedRef.current && post.liked) {
      setPulseKey((k) => k + 1);
    }
    previousLikedRef.current = post.liked;
  }, [post.liked]);

  const triggerHeart = useCallback(() => {
    heartScale.setValue(0);
    Animated.spring(heartScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 90,
    }).start(() => heartScale.setValue(0));
  }, [heartScale]);

  const handleOpenDetails = useCallback(() => {
    navigation.navigate('PostDetails', { postId: post.id, post });
  }, [navigation, post]);

  const handleBodyPress = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      triggerHeart();
      if (!post.liked) {
        handleLikeToggle().catch(() => undefined);
      }
    } else {
      handleOpenDetails();
    }
    lastTap.current = now;
  }, [handleLikeToggle, handleOpenDetails, post.liked, triggerHeart]);

  const handleOpenProfile = useCallback(() => {
    navigation.navigate('UserProfile', { userId: post.author.id });
  }, [navigation, post.author.id]);

  return (
    <Animated.View style={[styles.wrapper, entrance.style]}>
      <AnimatedPressable
        onPressIn={pressAnim.onPressIn}
        onPressOut={pressAnim.onPressOut}
        style={[styles.card, pressAnim.style]}
      >
        <LinearGradient
          colors={[theme.feed.accentBlue, theme.feed.accentCyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardInner}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleOpenProfile}>
                <UserAvatar uri={post.author.photo} label={post.author.name} size={42} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.meta} onPress={handleOpenProfile}>
                <Text style={styles.author}>{post.author.name}</Text>
                <Text style={styles.handle}>@{post.author.handle}</Text>
                <Text style={styles.timestamp}>
                  {new Date(post.created_at).toLocaleString()}
                </Text>
              </TouchableOpacity>
              {post.author.id !== currentUserId && (
                <TouchableOpacity
                  style={styles.followButton}
                  onPress={handleFollowToggle}
                  disabled={followPending}
                >
                  <Text style={styles.followButtonText}>
                    {followPending ? '…' : isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={handleBodyPress} activeOpacity={0.92}>
              <View style={styles.body}>
                <PostContent
                  text={post.text}
                  media={post.media}
                  video={post.video}
                  shouldAutoplay={shouldPlayVideo}
                  isScreenFocused={isFeedFocused}
                  legacySources={[
                    post.images,
                    post.image_urls,
                    post.image_url,
                    (post as any)?.image,
                    (post as any)?.photo,
                    (post as any)?.photos,
                  ]}
                />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleLikeToggle}
                accessibilityRole="button"
                disabled={likePending}
                onPressIn={likePress.onPressIn}
                onPressOut={likePress.onPressOut}
                style={[
                  styles.actionPill,
                  likePending && styles.likeDisabled,
                  likePress.style,
                ]}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={
                    post.liked
                      ? [theme.feed.accentBlue, theme.feed.accentCyan]
                      : ['rgba(59,130,246,0.18)', 'rgba(34,211,238,0.12)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionGradient}
                >
                  <Animated.View style={pulse.animatedStyle}>
                    <Text
                      style={[styles.actionText, post.liked && styles.actionTextActive]}
                    >
                      {post.liked ? 'Unlike' : 'Like'} • {post.like_count}
                    </Text>
                  </Animated.View>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleOpenDetails}
                accessibilityRole="button"
                style={[styles.actionPill, commentPress.style]}
                activeOpacity={0.85}
                onPressIn={commentPress.onPressIn}
                onPressOut={commentPress.onPressOut}
              >
                <LinearGradient
                  colors={['rgba(148,163,184,0.16)', 'rgba(59,130,246,0.12)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionText}>Comments • {post.comment_count}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.heartBurst,
            {
              transform: [{ scale: heartScale }],
              opacity: heartScale,
            },
          ]}
        >
          <Text style={styles.heartIcon}>♥</Text>
        </Animated.View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export const FeedPostCard = memo(FeedPostCardComponent);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: theme.feed.accentBlue,
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  cardGradient: {
    padding: 1.5,
    borderRadius: 24,
  },
  cardInner: {
    backgroundColor: theme.feed.glass,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.feed.border,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  meta: {
    flex: 1,
  },
  author: {
    fontWeight: '600',
    color: theme.feed.textPrimary,
    fontSize: 16,
  },
  handle: {
    color: theme.feed.textMuted,
    fontSize: 12,
  },
  timestamp: {
    color: theme.feed.textMuted,
    fontSize: 12,
  },
  followButton: {
    borderWidth: 1,
    borderColor: theme.feed.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'center',
    backgroundColor: 'rgba(59,130,246,0.12)',
  },
  followButtonText: {
    color: theme.feed.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    marginTop: 14,
  },
  divider: {
    height: 1,
    backgroundColor: theme.feed.glow,
    marginTop: 16,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionPill: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  actionGradient: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.feed.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  actionText: {
    color: theme.feed.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionTextActive: {
    color: '#fff',
  },
  likeDisabled: {
    opacity: 0.6,
  },
  heartBurst: {
    position: 'absolute',
    right: 18,
    bottom: 36,
  },
  heartIcon: {
    fontSize: 28,
    color: '#F472B6',
    textShadowColor: 'rgba(244,114,182,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
});
