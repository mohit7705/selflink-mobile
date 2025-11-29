declare module 'react-native-event-source' {
  type EventSourceListener = (event: { data?: string }) => void;

  export type EventSourceOptions = {
    headers?: Record<string, string>;
  };

  export default class EventSource {
    constructor(url: string, options?: EventSourceOptions);
    onmessage?: EventSourceListener;
    onerror?: EventSourceListener;
    addEventListener(type: string, listener: EventSourceListener): void;
    removeEventListener(type: string, listener: EventSourceListener): void;
    close(): void;
  }
}
