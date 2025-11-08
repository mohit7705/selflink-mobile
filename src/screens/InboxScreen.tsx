import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThreadCard } from '@components/ThreadCard';
import { useThreads } from '@hooks/useThreads';
import { RootStackParamList } from '@navigation/AppNavigator';
import { theme } from '@theme/index';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export function InboxScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { threads, loading, refreshing, loadMore, hasMore, refresh } = useThreads();

  const openThread = useCallback(
    (threadId: number) => {
      navigation.navigate('Messages', { threadId });
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Text style={styles.title}>Inbox</Text>
        <Text style={styles.subtitle}>
          Choose a conversation. Each thread should feel as intentional as a Jobs keynote.
        </Text>
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={threads}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ThreadCard thread={item} onPress={() => openThread(item.id)} />}
        onEndReachedThreshold={0.2}
        onEndReached={() => {
          if (hasMore && !loading && !refreshing) {
            loadMore();
          }
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#fff" />}
        ListFooterComponent={
          loading ? (
            <View style={styles.loader}>
              <ActivityIndicator color={theme.palette.platinum} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No threads yet</Text>
              <Text style={styles.emptyCopy}>
                Once conversations begin, they’ll appear right here.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.palette.midnight,
  },
  hero: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.palette.platinum,
    ...theme.typography.title,
  },
  subtitle: {
    color: theme.palette.silver,
    ...theme.typography.body,
  },
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  loader: {
    paddingVertical: theme.spacing.md,
  },
  empty: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    color: theme.palette.platinum,
    ...theme.typography.subtitle,
  },
  emptyCopy: {
    color: theme.palette.silver,
    ...theme.typography.body,
    textAlign: 'center',
    maxWidth: 280,
  },
});
