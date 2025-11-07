import { act, render, waitFor } from '@testing-library/react-native';
import { useEffect } from 'react';

import { ToastProvider, useToast } from '@context/ToastContext';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

type ToastApi = ReturnType<typeof useToast>;

function ToastHarness({ onChange }: { onChange: (api: ToastApi) => void }) {
  const api = useToast();
  useEffect(() => {
    onChange(api);
  }, [api, onChange]);
  return null;
}

describe('ToastContext', () => {
  it('queues toasts and dismisses them manually', async () => {
    let ctx: ToastApi | null = null;
    render(
      <ToastProvider>
        <ToastHarness onChange={(api) => (ctx = api)} />
      </ToastProvider>,
    );

    expect(ctx).not.toBeNull();
    const api = () => ctx as ToastApi;

    act(() => {
      api().push({ message: 'Hello', tone: 'info' });
      api().push({ message: 'World', tone: 'error' });
    });

    await waitFor(() => expect(api().toasts).toHaveLength(2));

    act(() => {
      api().dismiss(api().toasts[0].id);
    });

    await waitFor(() => {
      expect(api().toasts).toHaveLength(1);
      expect(api().toasts[0].message).toBe('World');
    });
  });

  it('auto dismisses toasts after duration', async () => {
    let ctx: ToastApi | null = null;
    render(
      <ToastProvider>
        <ToastHarness onChange={(api) => (ctx = api)} />
      </ToastProvider>,
    );

    const api = () => ctx as ToastApi;

    act(() => {
      api().push({ message: 'Ephemeral', tone: 'info', duration: 2000 });
    });

    await waitFor(() => expect(api().toasts).toHaveLength(1));

    act(() => {
      jest.advanceTimersByTime(2500);
    });

    await waitFor(() => expect(api().toasts).toHaveLength(0));
  });
});
