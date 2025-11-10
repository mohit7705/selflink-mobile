import { User } from './user';

export interface MediaAsset {
  id: number;
  s3_key: string;
  mime: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  status: string;
  checksum: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface Post {
  id: number;
  author: User;
  text: string;
  visibility: string;
  language: string;
  media: MediaAsset[];
  like_count: number;
  comment_count: number;
  liked: boolean;
  created_at: string;
}

export interface PostInput {
  text: string;
  visibility?: string;
  language?: string;
  media_ids?: number[];
}

export interface Comment {
  id: number;
  post: number;
  author: User;
  text: string;
  parent: number | null;
  created_at: string;
}

export interface CommentInput {
  post: number;
  text: string;
  parent?: number | null;
}

export interface TimelineEntry {
  id: number;
  post: Post;
  score: number;
  created_at: string;
}

export interface FeedQuery {
  since?: string;
}
