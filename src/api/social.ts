import { apiClient } from './client';
import { Comment, CommentInput, FeedQuery, Post, PostInput, TimelineEntry } from '@types/social';

function buildQuery(path: string, params?: Record<string, string | undefined>) {
  const query = Object.entries(params ?? {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`)
    .join('&');
  return query ? `${path}?${query}` : path;
}

export async function getFeed(query?: FeedQuery): Promise<TimelineEntry[]> {
  const url = buildQuery('/feed/home/', {
    since: query?.since,
  });
  const { data } = await apiClient.get<TimelineEntry[]>(url);
  return data;
}

export async function getPost(postId: number): Promise<Post> {
  const { data } = await apiClient.get<Post>(`/posts/${postId}/`);
  return data;
}

export async function createPost(payload: PostInput): Promise<Post> {
  const { data } = await apiClient.post<Post>('/posts/', payload);
  return data;
}

export async function likePost(postId: number): Promise<{ liked: boolean }> {
  const { data } = await apiClient.post<{ liked: boolean }>(`/posts/${postId}/like/`);
  return data;
}

export async function unlikePost(postId: number): Promise<{ liked: boolean }> {
  const { data } = await apiClient.post<{ liked: boolean }>(`/posts/${postId}/unlike/`);
  return data;
}

export async function getComments(postId: number): Promise<Comment[]> {
  const url = buildQuery('/comments/', { post: String(postId) });
  const { data } = await apiClient.get<Comment[]>(url);
  return data;
}

export async function addComment(payload: CommentInput): Promise<Comment> {
  const { data } = await apiClient.post<Comment>('/comments/', payload);
  return data;
}
