import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { followUser, getUserProfile, unfollowUser } from '@api/users';
import { getOrCreateDirectThread } from '@api/messaging';
import type { UserSummary } from '@api/users';

interface RouteParams {
  userId: number;
}

type ProfileRoute = RouteProp<Record<'UserProfile', RouteParams>, 'UserProfile'>;

export function UserProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ProfileRoute>();
  const [profile, setProfile] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const userId = route.params.userId;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(undefined);
    getUserProfile(userId)
      .then((data) => {
        if (!isMounted) return;
        setProfile(data);
        setIsFollowing(Boolean(data.is_following));
        setFollowersCount(data.followers_count ?? 0);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load user.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleFollowToggle = useCallback(async () => {
    if (!profile) return;
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowersCount((prev) => Math.max(0, prev + (nextState ? 1 : -1)));
    try {
      if (nextState) {
        await followUser(profile.id);
      } else {
        await unfollowUser(profile.id);
      }
    } catch (err) {
      console.warn('UserProfile: follow toggle failed', err);
      setIsFollowing(!nextState);
      setFollowersCount((prev) => Math.max(0, prev + (nextState ? -1 : 1)));
    }
  }, [profile, isFollowing]);

  const handleMessage = useCallback(async () => {
    if (!profile) return;
    try {
      const thread = await getOrCreateDirectThread(profile.id);
      navigation.navigate('Chat', { threadId: thread.id, otherUserId: profile.id });
    } catch (err) {
      console.warn('UserProfile: failed to start DM', err);
    }
  }, [navigation, profile]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Text>{error ?? 'User not found.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{profile.name || profile.handle || profile.username}</Text>
      <Text style={styles.handle}>@{profile.handle || profile.username}</Text>
      {profile.bio ? <Text>{profile.bio}</Text> : null}
      <View style={styles.statsRow}>
        <Text>Followers: {followersCount}</Text>
        <Text>Following: {profile.following_count ?? 0}</Text>
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleFollowToggle}>
          <Text style={styles.actionLabel}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
          <Text style={styles.actionLabel}>Message</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.linksRow}>
        <Button title="Followers" onPress={() => console.log('TODO: followers list')} />
        <Button title="Following" onPress={() => console.log('TODO: following list')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '600' },
  handle: { color: '#475569' },
  statsRow: { flexDirection: 'row', gap: 16 },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionLabel: { fontWeight: '600' },
  linksRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
});
