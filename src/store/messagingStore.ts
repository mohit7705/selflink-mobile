import { create } from 'zustand';

import * as messagingApi from '@api/messaging';
import type { Message, Thread } from '@schemas/messaging';

interface MessagingState {
  threads: Thread[];
  messagesByThread: Record<string, Message[]>;
  isLoadingThreads: boolean;
  isLoadingMessages: boolean;
  error?: string;
  loadThreads: () => Promise<void>;
  loadThreadMessages: (threadId: string | number) => Promise<void>;
  sendMessage: (threadId: string | number, text: string) => Promise<void>;
  handleIncomingMessage: (message: Message) => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  threads: [],
  messagesByThread: {},
  isLoadingThreads: false,
  isLoadingMessages: false,
  error: undefined,
  async loadThreads() {
    set({ isLoadingThreads: true, error: undefined });
    try {
      const threads = await messagingApi.getThreads();
      set({ threads });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to load threads.' });
    } finally {
      set({ isLoadingThreads: false });
    }
  },
  async loadThreadMessages(threadId) {
    set({ isLoadingMessages: true, error: undefined });
    try {
      const messages = await messagingApi.getThreadMessages(threadId);
      set((state) => ({
        messagesByThread: {
          ...state.messagesByThread,
          [String(threadId)]: messages,
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
      set((state) => {
        const key = String(threadId);
        const existing = state.messagesByThread[key] ?? [];
        return {
          messagesByThread: {
            ...state.messagesByThread,
            [key]: [...existing, message],
          },
        };
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to send message.' });
      throw error;
    }
  },
  handleIncomingMessage(message) {
    set((state) => {
      const key = String(message.thread);
      const existing = state.messagesByThread[key] ?? [];
      const alreadyExists = existing.some((item) => item.id === message.id);
      return {
        messagesByThread: {
          ...state.messagesByThread,
          [key]: alreadyExists ? existing : [...existing, message],
        },
      };
    });
  },
}));
