import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
  Dimensions,
} from 'react-native';

import { SoulReelItem } from '@components/SoulReelItem';
import type { VideoFeedItem, VideoFeedMode } from '@schemas/videoFeed';
import { useVideoFeedStore } from '@store/videoFeedStore';
import { theme } from '@theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function SoulReelsScreen() {
  const navigation = useNavigation<any>();
  const currentMode = useVideoFeedStore((state) => state.currentMode);
  const items = useVideoFeedStore((state) => state.itemsByMode[state.currentMode]);
  const isLoading = useVideoFeedStore((state) => state.isLoadingByMode[state.currentMode]);
  const isPaging = useVideoFeedStore((state) => state.isPagingByMode[state.currentMode]);
  const error = useVideoFeedStore((state) => state.errorByMode[state.currentMode]);
  const fetchFirstPage = useVideoFeedStore((state) => state.fetchFirstPage);
  const fetchNextPage = useVideoFeedStore((state) => state.fetchNextPage);
  const setMode = useVideoFeedStore((state) => state.setMode);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  });

  useEffect(() => {
    fetchFirstPage().catch(() => undefined);
  }, [fetchFirstPage]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken<VideoFeedItem>> }) => {
      const visible = viewableItems.find((item) => item.isViewable);
      if (visible?.item?.id !== undefined) {
        setActiveId(String(visible.item.id));
      }
    },
  ).current;

  const handleModeChange = useCallback(
    (mode: VideoFeedMode) => {
      if (mode === currentMode) {
        return;
      }
      setMode(mode);
      setActiveId(null);
    },
    [currentMode, setMode],
  );

  const renderItem = useCallback(
    ({ item }: { item: VideoFeedItem }) => (
      <SoulReelItem post={item.post} isActive={String(item.id) === String(activeId)} />
    ),
    [activeId],
  );

  const keyExtractor = useCallback((item: VideoFeedItem) => String(item.id), []);

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator color="#fff" />
        </View>
      );
    }
    return (
      <View style={styles.loader}>
        <Text style={styles.emptyText}>No videos yet</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <View style={styles.modeSwitch}>
          {(['for_you', 'following'] as VideoFeedMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => handleModeChange(mode)}
              style={[styles.modeButton, currentMode === mode && styles.modeButtonActive]}
            >
              <Text
                style={[
                  styles.modeLabel,
                  currentMode === mode && styles.modeLabelActive,
                ]}
              >
                {mode === 'for_you' ? 'For You' : 'Following'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ width: 48 }} />
      </View>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        disableIntervalMomentum
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.6}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchFirstPage().catch(() => undefined)}
            tintColor="#fff"
          />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isPaging ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null
        }
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchFirstPage().catch(() => undefined)}>
            <Text style={styles.retry}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingTop: 36,
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backLabel: {
    color: '#fff',
    fontWeight: '700',
  },
  modeSwitch: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(15,23,42,0.6)',
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.35)',
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  modeButtonActive: {
    backgroundColor: theme.gradients.cosmicBlue[0],
  },
  modeLabel: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
  modeLabelActive: {
    color: '#0B1120',
  },
  loader: {
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
  footerLoader: {
    paddingVertical: 16,
  },
  errorBanner: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(239,68,68,0.9)',
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 6,
  },
  retry: {
    color: '#0B1120',
    fontWeight: '700',
  },
});
