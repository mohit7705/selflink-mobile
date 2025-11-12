import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import * as messagingApi from '@api/messaging';
import type { Message } from '@schemas/messaging';
import { connectRealtime, RealtimePayload } from '@realtime/index';
import { useAuthStore } from '@store/authStore';
import { useMessagingStore } from '@store/messagingStore';

type MessageEnvelope = RealtimePayload & {
  type?: string;
  message?: Message;
  message_id?: number;
  thread_id?: number;
};

const POLL_INTERVAL_MS = 12_000;

export function useMessagingSync(enabled: boolean) {
  const token = useAuthStore((state) => state.accessToken);
  const currentUserId = useAuthStore((state) => state.currentUser?.id ?? null);
  const appendMessage = useMessagingStore((state) => state.appendMessage);
  const syncThreads = useMessagingStore((state) => state.syncThreads);
  const setSessionUserId = useMessagingStore((state) => state.setSessionUserId);
  const resetMessaging = useMessagingStore((state) => state.reset);

  const connectionRef = useRef<ReturnType<typeof connectRealtime> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const realtimeConnectedRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const inflightMessages = useRef(new Map<number, Promise<Message | null>>());

  useEffect(() => {
    setSessionUserId(currentUserId);
  }, [currentUserId, setSessionUserId]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!enabled || pollTimerRef.current) {
      return;
    }
    syncThreads().catch(() => undefined);
    pollTimerRef.current = setInterval(() => {
      syncThreads().catch(() => undefined);
    }, POLL_INTERVAL_MS);
  }, [enabled, syncThreads]);

  useEffect(() => {
    const handleAppStateChange = (next: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (!enabled) {
        return;
      }
      if (next === 'active') {
        if (prev !== 'active') {
          syncThreads().catch(() => undefined);
        }
        if (!realtimeConnectedRef.current) {
          startPolling();
        }
      } else {
        stopPolling();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [enabled, startPolling, stopPolling, syncThreads]);

  const fetchMessageDetails = useCallback((messageId?: number) => {
    if (!messageId) {
      return Promise.resolve<Message | null>(null);
    }
    const existing = inflightMessages.current.get(messageId);
    if (existing) {
      return existing;
    }
    const request = messagingApi
      .getMessage(messageId)
      .catch((error) => {
        console.warn('useMessagingSync: failed to fetch message', error);
        return null;
      })
      .finally(() => {
        inflightMessages.current.delete(messageId);
      });
    inflightMessages.current.set(messageId, request);
    return request;
  }, []);

  const handleRealtimeMessage = useCallback(
    async (payload: MessageEnvelope) => {
      const directMessage = payload.message;
      let nextMessage: Message | null = null;
      if (directMessage?.sender) {
        nextMessage = directMessage;
      } else if (payload.message_id) {
        nextMessage = await fetchMessageDetails(payload.message_id);
      }

      if (!nextMessage) {
        await syncThreads();
        return;
      }

      appendMessage(nextMessage.thread, nextMessage);
    },
    [appendMessage, fetchMessageDetails, syncThreads],
  );

  const handleRealtimePayload = useCallback(
    (payload: RealtimePayload) => {
      const type = typeof payload === 'object' ? (payload.type as string | undefined) : undefined;
      if (type === 'status') {
        const status = (payload as any).status;
        if (status === 'open') {
          realtimeConnectedRef.current = true;
          stopPolling();
        } else if (status === 'closed') {
          realtimeConnectedRef.current = false;
          if (appStateRef.current === 'active') {
            startPolling();
          }
        } else if (status === 'connecting') {
          realtimeConnectedRef.current = false;
        }
        return;
      }
      if (type === 'message') {
        handleRealtimeMessage(payload as MessageEnvelope).catch(() => undefined);
      } else if (type === 'typing') {
        // no-op for now
      }
    },
    [handleRealtimeMessage, startPolling, stopPolling],
  );

  useEffect(() => {
    if (!enabled || !token) {
      connectionRef.current?.disconnect();
      connectionRef.current = null;
      realtimeConnectedRef.current = false;
      stopPolling();
      if (!token) {
        resetMessaging();
      }
      return;
    }
    syncThreads().catch(() => undefined);
    const connection = connectRealtime(token);
    connectionRef.current = connection;
    const unsubscribe = connection.subscribe(handleRealtimePayload);
    return () => {
      unsubscribe();
      connection.disconnect();
      connectionRef.current = null;
      realtimeConnectedRef.current = false;
      stopPolling();
    };
  }, [enabled, handleRealtimePayload, resetMessaging, stopPolling, syncThreads, token]);
}
