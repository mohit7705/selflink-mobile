import type { AxiosRequestConfig } from 'axios';

import { apiClient } from './client';
import type { CreateThreadPayload, Message, Thread } from '@schemas/messaging';
import { parseJsonPreservingLargeInts } from '@utils/json';

type ListPayload<T> = T[] | { results?: T[] | null };

const threadIdMap = new Map<string, string>();

const toKey = (value: unknown) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

const rememberThreadFromResponse = (approx: unknown, precise: unknown) => {
  if (!approx || !precise) {
    return;
  }
  if (Array.isArray(approx) && Array.isArray(precise)) {
    approx.forEach((item, index) => {
      rememberThreadFromResponse(item, precise[index]);
    });
    return;
  }
  if (typeof approx === 'object' && typeof precise === 'object') {
    const approxId = toKey((approx as Record<string, unknown>).id);
    const preciseId = toKey((precise as Record<string, unknown>).id);
    if (approxId && preciseId) {
      threadIdMap.set(approxId, preciseId);
    }
    const approxResults = (approx as Record<string, unknown>).results;
    const preciseResults = (precise as Record<string, unknown>).results;
    if (Array.isArray(approxResults) && Array.isArray(preciseResults)) {
      approxResults.forEach((item, index) => {
        rememberThreadFromResponse(item, preciseResults[index]);
      });
    }
  }
};

const resolveThreadId = (threadId: string | number): string => {
  const key = String(threadId);
  return threadIdMap.get(key) ?? key;
};

async function requestWithPrecision<T>(config: AxiosRequestConfig): Promise<{
  parsed: T;
  precise: unknown;
}> {
  const response = await apiClient.request<string>({
    ...config,
    responseType: 'text',
    transformResponse: [(data) => data],
  });
  const raw =
    typeof response.data === 'string'
      ? response.data
      : response.data != null
        ? String(response.data)
        : '';
  const parsed: T = raw ? JSON.parse(raw) : (null as T);
  const precise = raw ? parseJsonPreservingLargeInts(raw) : parsed;
  return { parsed, precise };
}

function extractResults<T>(payload: ListPayload<T>): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.results)) {
    return payload.results;
  }
  return [];
}

export async function getThreads(): Promise<Thread[]> {
  const { parsed, precise } = await requestWithPrecision<ListPayload<Thread>>({
    method: 'GET',
    url: '/threads/',
  });
  rememberThreadFromResponse(parsed, precise);
  return extractResults(parsed);
}

export async function createThread(payload: CreateThreadPayload): Promise<Thread> {
  const { parsed, precise } = await requestWithPrecision<Thread>({
    method: 'POST',
    url: '/threads/',
    data: payload,
  });
  rememberThreadFromResponse(parsed, precise);
  return parsed;
}

export async function getThreadMessages(
  threadId: string | number,
  cursor?: string,
): Promise<Message[]> {
  const params = new URLSearchParams({ thread: resolveThreadId(threadId) });
  if (cursor) {
    params.append('cursor', cursor);
  }
  const { data } = await apiClient.get<ListPayload<Message>>(
    `/messages/?${params.toString()}`,
  );
  return extractResults(data);
}

export async function sendMessage(threadId: string | number, text: string): Promise<Message> {
  const { data } = await apiClient.post<Message>('/messages/', {
    thread: resolveThreadId(threadId),
    body: text,
  });
  return data;
}

export async function getOrCreateDirectThread(
  userId: number | string,
  initialMessage?: string,
): Promise<Thread> {
  const payload: Record<string, unknown> = { user_id: String(userId) };
  if (initialMessage?.trim()) {
    payload.initial_message = initialMessage.trim();
  }
  const { parsed, precise } = await requestWithPrecision<Thread>({
    method: 'POST',
    url: '/threads/direct/',
    data: payload,
  });
  rememberThreadFromResponse(parsed, precise);
  return parsed;
}
export async function getThread(threadId: string | number): Promise<Thread> {
  const { parsed, precise } = await requestWithPrecision<Thread>({
    method: 'GET',
    url: `/threads/${resolveThreadId(threadId)}/`,
  });
  rememberThreadFromResponse(parsed, precise);
  return parsed;
}

export async function markThreadRead(threadId: string | number): Promise<void> {
  await apiClient.post(`/threads/${resolveThreadId(threadId)}/read/`, {});
}

export async function getMessage(messageId: string | number): Promise<Message> {
  const { parsed, precise } = await requestWithPrecision<Message>({
    method: 'GET',
    url: `/messages/${messageId}/`,
  });
  rememberThreadFromResponse(parsed, precise);
  return parsed;
}
