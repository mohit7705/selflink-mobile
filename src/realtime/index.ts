import { env } from '@config/env';

type StatusEvent = {
  type: 'status';
  status: 'connecting' | 'open' | 'closed';
  attempt: number;
};

export type RealtimePayload = StatusEvent | Record<string, unknown>;

type RealtimeHandler = (payload: RealtimePayload) => void;

export interface RealtimeConnection {
  subscribe: (handler: RealtimeHandler) => () => void;
  unsubscribe: (handler?: RealtimeHandler) => void;
  disconnect: () => void;
  isConnected: () => boolean;
}

const MAX_BACKOFF_MS = 30_000;
const BASE_BACKOFF_MS = 1_000;
const PING_INTERVAL_MS = 25_000;

export function connectRealtime(token: string, urlOverride?: string): RealtimeConnection {
  const handlers = new Set<RealtimeHandler>();
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let shouldReconnect = true;
  let attempt = 0;

  const notify = (payload: RealtimePayload) => {
    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.warn('realtime: handler error', error);
      }
    });
  };

  const cleanupSocket = () => {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    if (socket) {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket = null;
    }
  };

  const scheduleReconnect = () => {
    if (!shouldReconnect) {
      return;
    }
    const timeout = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** attempt);
    reconnectTimer = setTimeout(() => {
      attempt += 1;
      connect();
    }, timeout);
  };

  const connect = () => {
    if (!shouldReconnect) {
      return;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    notify({ type: 'status', status: 'connecting', attempt });
    const url = new URL(urlOverride || env.realtimeUrl || 'ws://localhost:8001/ws');
    if (token) {
      url.searchParams.set('token', token);
    }
    socket = new WebSocket(url.toString());
    socket.onopen = () => {
      attempt = 0;
      notify({ type: 'status', status: 'open', attempt: 0 });
      if (pingTimer) {
        clearInterval(pingTimer);
      }
      pingTimer = setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, PING_INTERVAL_MS);
    };
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        notify(payload);
      } catch (error) {
        console.warn('realtime: failed to parse payload', error);
      }
    };
    socket.onerror = (error) => {
      console.warn('realtime: socket error', error);
    };
    socket.onclose = () => {
      notify({ type: 'status', status: 'closed', attempt });
      cleanupSocket();
      scheduleReconnect();
    };
  };

  connect();

  return {
    subscribe(handler) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    unsubscribe(handler) {
      if (handler) {
        handlers.delete(handler);
      } else {
        handlers.clear();
      }
    },
    disconnect() {
      shouldReconnect = false;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      socket?.close();
      cleanupSocket();
    },
    isConnected() {
      return socket?.readyState === WebSocket.OPEN;
    },
  };
}
