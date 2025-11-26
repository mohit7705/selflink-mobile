import type { Post } from './social';

export type VideoFeedMode = 'for_you' | 'following';

export type VideoFeedItem = {
  id: string | number;
  post: Post;
};

export interface VideoFeedResponse {
  items: VideoFeedItem[];
  next: string | null;
}
