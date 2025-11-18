import { isAxiosError } from 'axios';

import type { Comment, Post, TimelineEntry } from '@schemas/social';

import { apiClient } from './client';

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
  nextUrl: string | null;
}

export async function getFeed(nextUrl?: string): Promise<FeedResponse> {
  const url = nextUrl ?? FEED_ENDPOINT;
  const { data } = await apiClient.get<unknown>(url);

  const entries: TimelineEntry[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.results)
      ? ((data as { results: TimelineEntry[] }).results ?? [])
      : [];

  const next =
    (typeof data === 'object' && data !== null && 'next' in data
      ? (data as { next?: string | null }).next
      : null) ?? null;

  return {
    results: entries,
    nextUrl: next,
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

export type CommentImageAttachment = {
  uri: string;
  name?: string;
  type?: string;
};

export type AddCommentPayload = {
  body?: string;
  image?: CommentImageAttachment | null;
  images?: CommentImageAttachment[] | null;
};

const logApiError = (error: unknown, context: string) => {
  if (__DEV__ && isAxiosError(error)) {
    console.warn(`${context} failed`, error.response?.data ?? error.message);
  }
};

type RawComment = Omit<Comment, 'body' | 'image_url' | 'image_urls' | 'images'> & {
  body?: string | null;
  text?: string | null;
  image_url?: string | null;
  image?: string | null;
  image_urls?: Array<string | null> | null;
  images?: Array<string | { url?: string | null; uri?: string | null }> | null;
};

const normalizeComment = (comment: RawComment): Comment => {
  const body =
    typeof comment.body === 'string' && comment.body.length > 0
      ? comment.body
      : typeof comment.text === 'string'
        ? comment.text
        : '';
  const imageUrl =
    comment.image_url ??
    (typeof comment.image === 'string' && comment.image.length > 0
      ? comment.image
      : null);
  const imageUrls = Array.isArray(comment.image_urls)
    ? comment.image_urls.filter(
        (url): url is string => typeof url === 'string' && url.length > 0,
      )
    : null;
  const images = Array.isArray(comment.images)
    ? comment.images
        .map((item) => {
          if (typeof item === 'string') {
            return item;
          }
          if (item && typeof item === 'object') {
            if (typeof item.url === 'string') {
              return item.url;
            }
            if (typeof item.uri === 'string') {
              return item.uri;
            }
          }
          return undefined;
        })
        .filter((url): url is string => typeof url === 'string' && url.length > 0)
    : null;
  return {
    ...comment,
    body,
    image_url: imageUrl ?? null,
    image_urls: imageUrls,
    images,
  };
};

export async function likePost(postId: string): Promise<void> {
  try {
    await apiClient.post(`/posts/${postId}/like/`, {});
  } catch (error) {
    logApiError(error, 'likePost');
    throw error;
  }
}

export async function unlikePost(postId: string): Promise<void> {
  try {
    await apiClient.post(`/posts/${postId}/unlike/`, {});
  } catch (error) {
    logApiError(error, 'unlikePost');
    throw error;
  }
}

export async function addComment(
  postId: string,
  payload: AddCommentPayload,
): Promise<Comment> {
  const trimmed = payload.body?.trim() ?? '';
  const attachments: CommentImageAttachment[] = [];
  if (payload.images && payload.images.length > 0) {
    attachments.push(...payload.images);
  } else if (payload.image) {
    attachments.push(payload.image);
  }
  const hasImage = attachments.length > 0;
  if (!trimmed && !hasImage) {
    throw new Error('Write a comment or attach a photo.');
  }
  try {
    const endpoint = '/comments/';
    if (hasImage) {
      const formData = new FormData();
      formData.append('post', String(postId));
      formData.append('body', trimmed);
      formData.append('text', trimmed);
      attachments.forEach((attachment, index) => {
        formData.append('images', {
          uri: attachment.uri,
          name: attachment.name ?? `comment-photo-${index + 1}.jpg`,
          type: attachment.type ?? 'image/jpeg',
        } as unknown as Blob);
      });

      const { data } = await apiClient.post<RawComment>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return normalizeComment(data);
    }

    const { data } = await apiClient.post<RawComment>(endpoint, {
      post: String(postId),
      body: trimmed,
      text: trimmed,
    });
    return normalizeComment(data);
  } catch (error) {
    logApiError(error, 'addComment');
    throw error;
  }
}

export async function getPostComments(
  postId: string | number,
  page?: number,
): Promise<Comment[]> {
  const url = buildQuery('/comments/', {
    post: String(postId),
    page,
  });
  const { data } = await apiClient.get<unknown>(url);
  if (Array.isArray(data)) {
    return (data as RawComment[]).map(normalizeComment);
  }
  if (data && typeof data === 'object' && Array.isArray((data as any).results)) {
    const results = (data as { results: RawComment[] }).results ?? [];
    return results.map(normalizeComment);
  }
  return [];
}
