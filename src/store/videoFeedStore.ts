import { create } from 'zustand';

import * as videoFeedApi from '@api/videoFeed';
import type { VideoFeedItem, VideoFeedMode } from '@schemas/videoFeed';

type Nullable<T> = T | null;

const emptyByMode = <T>(value: T): Record<VideoFeedMode, T> => ({
  for_you: value,
  following: value,
});

interface VideoFeedState {
  currentMode: VideoFeedMode;
  itemsByMode: Record<VideoFeedMode, VideoFeedItem[]>;
  nextByMode: Record<VideoFeedMode, Nullable<string>>;
  isLoadingByMode: Record<VideoFeedMode, boolean>;
  isPagingByMode: Record<VideoFeedMode, boolean>;
  errorByMode: Record<VideoFeedMode, string | undefined>;
  setMode: (mode: VideoFeedMode) => void;
  fetchFirstPage: (mode?: VideoFeedMode) => Promise<void>;
  fetchNextPage: () => Promise<void>;
  refresh: (mode?: VideoFeedMode) => Promise<void>;
}

export const useVideoFeedStore = create<VideoFeedState>((set, get) => ({
  currentMode: 'for_you',
  itemsByMode: emptyByMode<VideoFeedItem[]>([]),
  nextByMode: emptyByMode<Nullable<string>>(null),
  isLoadingByMode: emptyByMode<boolean>(false),
  isPagingByMode: emptyByMode<boolean>(false),
  errorByMode: emptyByMode<string | undefined>(undefined),
  setMode(mode) {
    set({ currentMode: mode });
    const state = get();
    if (!state.itemsByMode[mode].length && !state.isLoadingByMode[mode]) {
      state.fetchFirstPage(mode).catch(() => undefined);
    }
  },
  async fetchFirstPage(modeParam) {
    const mode = modeParam ?? get().currentMode;
    set((state) => ({
      isLoadingByMode: { ...state.isLoadingByMode, [mode]: true },
      errorByMode: { ...state.errorByMode, [mode]: undefined },
    }));
    try {
      const response =
        mode === 'following'
          ? await videoFeedApi.getFollowingVideoFeed()
          : await videoFeedApi.getForYouVideoFeed();
      set((state) => ({
        itemsByMode: { ...state.itemsByMode, [mode]: response.items },
        nextByMode: { ...state.nextByMode, [mode]: response.next },
      }));
    } catch (error) {
      set((state) => ({
        errorByMode: {
          ...state.errorByMode,
          [mode]: error instanceof Error ? error.message : 'Unable to load videos.',
        },
      }));
    } finally {
      set((state) => ({
        isLoadingByMode: { ...state.isLoadingByMode, [mode]: false },
      }));
    }
  },
  async fetchNextPage() {
    const mode = get().currentMode;
    const { nextByMode, isPagingByMode } = get();
    const next = nextByMode[mode];
    if (!next || isPagingByMode[mode]) {
      return;
    }
    set((state) => ({
      isPagingByMode: { ...state.isPagingByMode, [mode]: true },
      errorByMode: { ...state.errorByMode, [mode]: undefined },
    }));
    try {
      const response =
        mode === 'following'
          ? await videoFeedApi.getFollowingVideoFeed(next)
          : await videoFeedApi.getForYouVideoFeed(next);
      set((state) => ({
        itemsByMode: {
          ...state.itemsByMode,
          [mode]: state.itemsByMode[mode].concat(response.items),
        },
        nextByMode: { ...state.nextByMode, [mode]: response.next },
      }));
    } catch (error) {
      set((state) => ({
        errorByMode: {
          ...state.errorByMode,
          [mode]:
            error instanceof Error ? error.message : 'Unable to load more video posts.',
        },
      }));
    } finally {
      set((state) => ({
        isPagingByMode: { ...state.isPagingByMode, [mode]: false },
      }));
    }
  },
  async refresh(modeParam) {
    const mode = modeParam ?? get().currentMode;
    await get().fetchFirstPage(mode);
  },
}));
