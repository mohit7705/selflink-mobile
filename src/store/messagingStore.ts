import { create } from 'zustand';

import * as messagingApi from '@api/messaging';
import type { Message, Thread } from '@schemas/messaging';

type MessagesByThread = Record<string, Message[]>;
type UnreadMap = Record<string, number>;

const sortThreadsByUpdatedAt = (threads: Thread[]) =>
  [...threads].sort((a, b) => new Date(b.updated_at).valueOf() - new Date(a.updated_at).valueOf());

const sortMessagesChronologically = (messages: Message[]) =>
  [...messages].sort(
    (a, b) => new Date(a.created_at).valueOf() - new Date(b.created_at).valueOf(),
  );

const normalizeThreadId = (threadId: string | number | undefined) => {
  if (threadId === null || threadId === undefined) {
    return '';
  }
  return String(threadId);
};

const computeTotalUnread = (unreadByThread: UnreadMap) =>
  Object.values(unreadByThread).reduce((sum, value) => sum + Math.max(0, value), 0);

const buildThreadSnapshot = (threads: Thread[]) => {
  const sorted = sortThreadsByUpdatedAt(threads);
  const unreadByThread: UnreadMap = {};
  for (const thread of sorted) {
    unreadByThread[String(thread.id)] = Math.max(0, thread.unread_count ?? 0);
  }
  return {
    threads: sorted,
    unreadByThread,
    totalUnread: computeTotalUnread(unreadByThread),
  };
};

const applyUnreadToThread = (threads: Thread[], threadKey: string, unread: number) => {
  const targetIndex = threads.findIndex((thread) => String(thread.id) === threadKey);
  if (targetIndex === -1) {
    return threads;
  }
  const target = threads[targetIndex];
  if ((target.unread_count ?? 0) === unread) {
    return threads;
  }
  const nextThreads = [...threads];
  nextThreads[targetIndex] = {
    ...target,
    unread_count: unread,
  };
  return nextThreads;
};

const initialState = {
  threads: [] as Thread[],
  messagesByThread: {} as MessagesByThread,
  unreadByThread: {} as UnreadMap,
  totalUnread: 0,
  activeThreadId: null as string | null,
  sessionUserId: null as number | null,
  isLoadingThreads: false,
  isLoadingMessages: false,
  error: undefined as string | undefined,
};

const pendingReadRequests = new Set<string>();

export interface MessagingState extends typeof initialState {
  loadThreads: () => Promise<void>;
  syncThreads: () => Promise<void>;
  setThreads: (threads: Thread[]) => void;
  mergeThread: (thread: Thread) => void;
  loadThreadMessages: (threadId: string | number) => Promise<void>;
  sendMessage: (threadId: string | number, text: string) => Promise<void>;
  appendMessage: (threadId: string | number, message: Message) => void;
  markThreadRead: (threadId: string | number, options?: { sync?: boolean }) => Promise<void>;
  setActiveThread: (threadId: string | null) => void;
  setSessionUserId: (userId: number | null) => void;
  recomputeTotalUnread: () => void;
  reset: () => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  ...initialState,
  async loadThreads() {
    set({ isLoadingThreads: true, error: undefined });
    try {
      const threads = await messagingApi.getThreads();
      set(buildThreadSnapshot(threads));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to load threads.' });
    } finally {
      set({ isLoadingThreads: false });
    }
  },
  async syncThreads() {
    try {
      const threads = await messagingApi.getThreads();
      set(buildThreadSnapshot(threads));
    } catch (error) {
      console.warn('messagingStore: failed to sync threads', error);
    }
  },
  setThreads(threads) {
    set(buildThreadSnapshot(threads));
  },
  mergeThread(thread) {
    const state = get();
    const nextThreads = sortThreadsByUpdatedAt([
      thread,
      ...state.threads.filter((existing) => existing.id !== thread.id),
    ]);
    const unreadByThread = {
      ...state.unreadByThread,
      [String(thread.id)]: Math.max(0, thread.unread_count ?? 0),
    };
    set({
      threads: nextThreads,
      unreadByThread,
      totalUnread: computeTotalUnread(unreadByThread),
    });
  },
  async loadThreadMessages(threadId) {
    const key = normalizeThreadId(threadId);
    if (!key) {
      return;
    }
    set({ isLoadingMessages: true, error: undefined });
    try {
      const messages = await messagingApi.getThreadMessages(threadId);
      set((state) => ({
        messagesByThread: {
          ...state.messagesByThread,
          [key]: sortMessagesChronologically(messages),
        },
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to load messages.' });
    } finally {
      set({ isLoadingMessages: false });
    }
  },
  async sendMessage(threadId, text) {
    if (!text.trim()) {
      return;
    }
    try {
      const message = await messagingApi.sendMessage(threadId, text.trim());
      get().appendMessage(threadId, message);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unable to send message.';
      set({ error: detail });
      throw error;
    }
  },
  appendMessage(threadId, message) {
    const key = normalizeThreadId(threadId ?? message.thread);
    if (!key) {
      return;
    }
    const state = get();
    const existingMessages = state.messagesByThread[key];
    const alreadyExists = existingMessages?.some((item) => item.id === message.id);
    let messagesByThread = state.messagesByThread;
    if (!alreadyExists) {
      const nextMessages = sortMessagesChronologically([...(existingMessages ?? []), message]);
      messagesByThread = {
        ...messagesByThread,
        [key]: nextMessages,
      };
    }

    const sessionUserId = state.sessionUserId;
    const isOwnMessage =
      sessionUserId != null &&
      message.sender?.id != null &&
      String(message.sender.id) === String(sessionUserId);
    const isActiveThread = state.activeThreadId === key;
    const currentUnread = state.unreadByThread[key] ?? 0;
    let unreadByThread = state.unreadByThread;
    let unreadChanged = false;
    let nextUnread = currentUnread;

    if (isOwnMessage || isActiveThread) {
      if (currentUnread !== 0) {
        nextUnread = 0;
        unreadByThread = { ...unreadByThread, [key]: 0 };
        unreadChanged = true;
      }
    } else if (!alreadyExists) {
      nextUnread = currentUnread + 1;
      unreadByThread = { ...unreadByThread, [key]: nextUnread };
      unreadChanged = true;
    }

    let threads = state.threads;
    const targetIndex = threads.findIndex((thread) => String(thread.id) === key);
    if (targetIndex !== -1) {
      const thread = threads[targetIndex];
      const needsUpdate =
        thread.last_message?.body !== message.body ||
        thread.last_message?.created_at !== message.created_at ||
        thread.updated_at !== message.created_at ||
        (thread.unread_count ?? 0) !== nextUnread;
      if (needsUpdate) {
        const nextThreads = [...threads];
        nextThreads[targetIndex] = {
          ...thread,
          last_message: {
            body: message.body,
            created_at: message.created_at,
          },
          updated_at: message.created_at,
          unread_count: nextUnread,
        };
        threads = sortThreadsByUpdatedAt(nextThreads);
      }
    }

    const changed =
      messagesByThread !== state.messagesByThread ||
      threads !== state.threads ||
      unreadByThread !== state.unreadByThread;

    if (!changed) {
      return;
    }

    set({
      messagesByThread,
      threads,
      unreadByThread,
      totalUnread: unreadChanged ? computeTotalUnread(unreadByThread) : state.totalUnread,
    });
  },
  async markThreadRead(threadId, options) {
    const key = normalizeThreadId(threadId);
    if (!key) {
      return;
    }
    const state = get();
    if ((state.unreadByThread[key] ?? 0) !== 0) {
      const unreadByThread = { ...state.unreadByThread, [key]: 0 };
      const threads = applyUnreadToThread(state.threads, key, 0);
      set({
        unreadByThread,
        threads,
        totalUnread: computeTotalUnread(unreadByThread),
      });
    }

    if (options?.sync === false || pendingReadRequests.has(key)) {
      return;
    }

    pendingReadRequests.add(key);
    try {
      await messagingApi.markThreadRead(threadId);
    } catch (error) {
      console.warn('messagingStore: failed to mark thread read', error);
      try {
        await get().syncThreads();
      } catch {
        // already logged in syncThreads
      }
    } finally {
      pendingReadRequests.delete(key);
    }
  },
  setActiveThread(threadId) {
    const key = threadId == null ? null : normalizeThreadId(threadId);
    if (get().activeThreadId === key) {
      return;
    }
    set({ activeThreadId: key });
  },
  setSessionUserId(userId) {
    if (get().sessionUserId === userId) {
      return;
    }
    set({ sessionUserId: userId });
  },
  recomputeTotalUnread() {
    set((state) => ({
      totalUnread: computeTotalUnread(state.unreadByThread),
    }));
  },
  reset() {
    set({ ...initialState });
  },
}));

export const selectThreads = (state: MessagingState) => state.threads;
export const selectIsLoadingThreads = (state: MessagingState) => state.isLoadingThreads;
export const selectMessagingError = (state: MessagingState) => state.error;
export const selectMessagesLoading = (state: MessagingState) => state.isLoadingMessages;
export const selectTotalUnread = (state: MessagingState) => state.totalUnread;
