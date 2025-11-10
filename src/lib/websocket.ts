import { env } from '@config/env';

interface Handlers {
  onMessage?: (payload: any) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function connectWebSocket(token: string, handlers: Handlers) {
  const url = new URL(env.realtimeUrl || 'ws://localhost:8001/ws');
  if (token) {
    url.searchParams.set('token', token);
  }
  const socket = new WebSocket(url.toString());

  socket.onopen = () => {
    handlers.onOpen?.();
  };
  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      handlers.onMessage?.(payload);
    } catch (error) {
      console.warn('websocket: failed to parse message', error);
    }
  };
  socket.onerror = (event) => {
    handlers.onError?.(event);
  };
  socket.onclose = () => {
    handlers.onClose?.();
  };

  return () => {
    socket.close();
  };
}
