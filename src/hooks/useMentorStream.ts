import { useCallback, useEffect, useRef, useState } from 'react';
import EventSource from 'react-native-event-source';

import { callMentorChat, buildMentorStreamUrl } from '@services/api/mentor';
import { useAuthStore } from '@store/authStore';

type MentorStreamOptions = {
  mode?: string;
  language?: string;
};

type MentorStreamState = {
  isStreaming: boolean;
  error: string | null;
  replyText: string;
  sessionId: number | null;
};

type MentorStreamControls = {
  startStream: (message: string) => void;
  reset: () => void;
};

type MentorStreamPayload =
  | { event: 'start'; session_id?: number; mode?: string }
  | { event: 'token'; delta?: string }
  | { event: 'end'; session_id?: number }
  | { event: 'error'; detail?: string };

type StreamMessageEvent = {
  data?: string;
};

const DEFAULT_MODE = 'default';
const DEFAULT_LANGUAGE = 'en';
const STREAM_TIMEOUT_MS = 12000;

const parsePayload = (raw: string): MentorStreamPayload | null => {
  try {
    return JSON.parse(raw) as MentorStreamPayload;
  } catch {
    return null;
  }
};

/**
 * Streaming hook for Mentor replies.
 * Connects to the backend SSE endpoint (/api/v1/mentor/stream/) and streams tokens in real time.
 * Falls back to the non-streaming mentor chat endpoint if SSE is unavailable.
 */
export function useMentorStream(
  options?: MentorStreamOptions,
): MentorStreamState & MentorStreamControls {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const fallbackUsedRef = useRef(false);
  const pendingMessageRef = useRef<string | null>(null);
  const streamTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStreamTimeout = useCallback(() => {
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = null;
    }
  }, []);

  const closeStream = useCallback(() => {
    const source: any = eventSourceRef.current;
    eventSourceRef.current = null;
    try {
      if (!source) {
        return;
      }
      source.onopen = null;
      source.onmessage = null;
      source.onerror = null;
      if (source.removeEventListener) {
        source.removeEventListener('start', source.onmessage);
        source.removeEventListener('token', source.onmessage);
        source.removeEventListener('end', source.onmessage);
        source.removeEventListener('error', source.onerror);
      }
      if (source._xhr && typeof source._xhr.abort === 'function') {
        source._xhr.abort();
      } else if (typeof source.close === 'function') {
        source.close();
      }
    } catch {
      // swallow; cleanup must be safe
    } finally {
      clearStreamTimeout();
    }
  }, [clearStreamTimeout]);

  const reset = useCallback(() => {
    closeStream();
    fallbackUsedRef.current = false;
    pendingMessageRef.current = null;
    setError(null);
    setReplyText('');
    setSessionId(null);
    setIsStreaming(false);
  }, [closeStream]);

  const fallbackToHttp = useCallback(
    async (message: string, mode: string, language: string) => {
      fallbackUsedRef.current = true;
      clearStreamTimeout();
      if (__DEV__) {
        console.debug('[useMentorStream] Falling back to POST /api/v1/mentor/chat/');
      }
      try {
        const response = await callMentorChat({ mode, language, message });
        setSessionId(response.sessionId);
        setReplyText(response.reply);
        setError(null);
      } catch (fallbackError) {
        const fallbackMessage =
          fallbackError instanceof Error
            ? fallbackError.message
            : 'Mentor is temporarily unavailable.';
        setError(fallbackMessage);
      } finally {
        setIsStreaming(false);
        closeStream();
      }
    },
    [clearStreamTimeout, closeStream],
  );

  const startStream = useCallback(
    (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || isStreaming) {
        return;
      }

      closeStream();
      const mode = options?.mode ?? DEFAULT_MODE;
      const language = options?.language ?? DEFAULT_LANGUAGE;

      setError(null);
      setReplyText('');
      setSessionId(null);
      setIsStreaming(true);
      fallbackUsedRef.current = false;
      pendingMessageRef.current = trimmed;
      clearStreamTimeout();

      const streamUrl = buildMentorStreamUrl({
        mode,
        language,
        message: trimmed,
      });

      if (__DEV__) {
        console.debug('[useMentorStream] Opening stream', streamUrl);
      }

      const handleFailure = (detail?: string) => {
        clearStreamTimeout();
        closeStream();
        if (!fallbackUsedRef.current) {
          fallbackToHttp(trimmed, mode, language).catch(() => undefined);
          return;
        }
        setError(detail ?? 'Stream connection error.');
        setIsStreaming(false);
      };

      const handlePayload = (raw: string) => {
        const payload = parsePayload(raw);
        if (!payload?.event) {
          return;
        }
        switch (payload.event) {
          case 'start':
            if (typeof payload.session_id === 'number') {
              setSessionId(payload.session_id);
            }
            clearStreamTimeout();
            break;
          case 'token':
            if (typeof payload.delta === 'string') {
              setReplyText((current) => current + payload.delta);
            }
            clearStreamTimeout();
            break;
          case 'end':
            if (typeof payload.session_id === 'number') {
              setSessionId(payload.session_id);
            }
            clearStreamTimeout();
            setIsStreaming(false);
            closeStream();
            break;
          case 'error': {
            const detail =
              typeof payload.detail === 'string'
                ? payload.detail
                : 'Stream error. Using fallback.';
            handleFailure(detail);
            break;
          }
          default:
            break;
        }
      };

      try {
        const headers =
          accessToken && accessToken.length > 0
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined;
        const source = new EventSource(streamUrl, { headers });
        eventSourceRef.current = source;

        streamTimeoutRef.current = setTimeout(() => {
          handleFailure('Stream timeout. Using fallback.');
        }, STREAM_TIMEOUT_MS);

        source.onmessage = (event: StreamMessageEvent) =>
          event.data ? handlePayload(event.data) : undefined;
        source.onerror = () => handleFailure('Stream connection error.');

        source.addEventListener('start', (event: StreamMessageEvent) =>
          event.data ? handlePayload(event.data) : undefined,
        );
        source.addEventListener('token', (event: StreamMessageEvent) =>
          event.data ? handlePayload(event.data) : undefined,
        );
        source.addEventListener('end', (event: StreamMessageEvent) =>
          event.data ? handlePayload(event.data) : undefined,
        );
        source.addEventListener('error', (event: StreamMessageEvent) => {
          const parsed = event.data ? parsePayload(event.data) : null;
          const detail =
            parsed?.event === 'error' && typeof parsed.detail === 'string'
              ? parsed.detail
              : 'Stream error. Using fallback.';
          handleFailure(detail);
        });
      } catch {
        handleFailure('Unable to open stream. Using fallback.');
      }
    },
    [
      accessToken,
      closeStream,
      fallbackToHttp,
      isStreaming,
      clearStreamTimeout,
      options?.language,
      options?.mode,
    ],
  );

  useEffect(() => {
    return () => {
      closeStream();
      clearStreamTimeout();
    };
  }, [clearStreamTimeout, closeStream]);

  return {
    isStreaming,
    error,
    replyText,
    sessionId,
    startStream,
    reset,
  };
}
