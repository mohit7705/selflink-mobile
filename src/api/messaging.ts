import { apiClient } from './client';
import { CreateThreadPayload, Message, SendMessagePayload, Thread } from '@types/messaging';
import { User } from '@types/user';

export async function getThreads(): Promise<Thread[]> {
  const { data } = await apiClient.get<Thread[]>('/threads/');
  return data;
}

export async function getThread(threadId: number): Promise<Thread> {
  const { data } = await apiClient.get<Thread>(`/threads/${threadId}/`);
  return data;
}

export async function createThread(payload: CreateThreadPayload): Promise<Thread> {
  const { data } = await apiClient.post<Thread>('/threads/', payload);
  return data;
}

export async function markThreadRead(threadId: number): Promise<void> {
  await apiClient.post(`/threads/${threadId}/read/`, {});
}

export interface TypingUsersResponse {
  typing_user_ids: number[];
  users: User[];
}

export async function getTypingUsers(threadId: number): Promise<TypingUsersResponse> {
  const { data } = await apiClient.get<TypingUsersResponse>(`/threads/${threadId}/typing/`);
  return data;
}

export async function sendTypingSignal(threadId: number, isTyping: boolean): Promise<{ is_typing: boolean }> {
  const { data } = await apiClient.post<{ is_typing: boolean }>(`/threads/${threadId}/typing/`, {
    is_typing: isTyping,
  });
  return data;
}

export async function leaveThread(threadId: number): Promise<void> {
  await apiClient.post(`/threads/${threadId}/leave/`, {});
}

export async function getMessages(threadId?: number): Promise<Message[]> {
  const url = threadId ? `/messages/?thread=${encodeURIComponent(String(threadId))}` : '/messages/';
  const { data } = await apiClient.get<Message[]>(url);
  return data;
}

export async function sendMessage(payload: SendMessagePayload): Promise<Message> {
  const { data } = await apiClient.post<Message>('/messages/', payload);
  return data;
}
