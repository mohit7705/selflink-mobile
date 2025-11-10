import { apiClient } from './client';
import type { Comment, Post, TimelineEntry } from '@schemas/social';

type QueryParams = Record<string, string | number | undefined>;

const FEED_ENDPOINT = '/feed/home/';

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

export interface FeedResponse {
  results: TimelineEntry[];
  nextCursor: string | null;
}

export async function getFeed(params?: { page?: number; cursor?: string }): Promise<FeedResponse> {
  const url = buildQuery(FEED_ENDPOINT, {
    page: params?.page,
    cursor: params?.cursor,
  });
  const { data } = await apiClient.get<TimelineEntry[]>(url);
  const lastEntry = data[data.length - 1];
  return {
    results: data,
    nextCursor: lastEntry?.created_at ?? null,
  };
}

export async function getPost(postId: string | number): Promise<Post> {
  const { data } = await apiClient.get<Post>(`/posts/${postId}/`);
  return data;
}

export interface CreatePostPayload {
  content: string;
  imageUris?: string[];
  visibility?: string;
  language?: string;
}

export async function createPost(payload: CreatePostPayload): Promise<Post> {
  if (payload.imageUris && payload.imageUris.length > 0) {
    const formData = new FormData();
    formData.append('text', payload.content);
    if (payload.visibility) {
      formData.append('visibility', payload.visibility);
    }
    if (payload.language) {
      formData.append('language', payload.language);
    }
    payload.imageUris.forEach((uri, index) => {
      formData.append('images', {
        uri,
        name: `upload-${index}.jpg`,
        type: 'image/jpeg',
      } as unknown as Blob);
    });
    const { data } = await apiClient.post<Post>('/posts/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
  const { data } = await apiClient.post<Post>('/posts/', {
    text: payload.content,
    visibility: payload.visibility,
    language: payload.language,
  });
  return data;
}

export async function likePost(postId: string | number): Promise<void> {
  await apiClient.post(`/posts/${postId}/like/`, {});
}

export async function unlikePost(postId: string | number): Promise<void> {
  await apiClient.post(`/posts/${postId}/unlike/`, {});
}

export async function addComment(postId: string | number, text: string): Promise<Comment> {
  const { data } = await apiClient.post<Comment>('/comments/', {
    post: postId,
    text,
  });
  return data;
}

export async function getPostComments(postId: string | number, page?: number): Promise<Comment[]> {
  const url = buildQuery('/comments/', {
    post: String(postId),
    page,
  });
  const { data } = await apiClient.get<Comment[]>(url);
  return data;
}
