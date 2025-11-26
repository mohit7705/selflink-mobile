import { apiClient } from './client';
import { normalizePost } from './social';

import type { VideoFeedItem, VideoFeedResponse } from '@schemas/videoFeed';

type QueryParams = Record<string, string | number | undefined>;

const buildQuery = (path: string, params?: QueryParams) => {
  if (!params) {
    return path;
  }
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
};

const asIdentifier = (value: unknown): string | null => {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return null;
};

const normalizeItems = (data: any): VideoFeedItem[] => {
  if (!data) {
    return [];
  }
  const raw = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
  return raw
    .map((entry: any, index: number) => {
      const post = entry?.post ?? entry;
      if (!post || typeof post !== 'object') {
        return null;
      }
      if (!post.video) {
        return null;
      }
      const id = asIdentifier(entry?.id ?? post?.id ?? index);
      if (!id) {
        return null;
      }
      return {
        id,
        post: normalizePost(post),
      };
    })
    .filter(Boolean) as VideoFeedItem[];
};

const normalizeResponse = (data: any): VideoFeedResponse => ({
  items: normalizeItems(data),
  next:
    data && typeof data === 'object' && typeof (data as any).next === 'string'
      ? (data as any).next
      : null,
});

export async function getForYouVideoFeed(next?: string | null): Promise<VideoFeedResponse> {
  const path = next ?? '/feed/for_you_videos/';
  const { data } = await apiClient.get(path);
  return normalizeResponse(data);
}

export async function getFollowingVideoFeed(
  next?: string | null,
): Promise<VideoFeedResponse> {
  const path = next ?? '/feed/following_videos/';
  const { data } = await apiClient.get(path);
  return normalizeResponse(data);
}
