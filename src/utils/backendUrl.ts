import { env } from '@config/env';

const BACKEND_BASE = env.backendUrl.replace(/\/$/, '');
const BACKEND_HOST = (() => {
  try {
    return new URL(BACKEND_BASE).host;
  } catch {
    return null;
  }
})();
const FORCE_HTTPS = (() => {
  try {
    return new URL(BACKEND_BASE).protocol === 'https:';
  } catch {
    return false;
  }
})();
const DEBUG_MEDIA_VERSION =
  typeof __DEV__ !== 'undefined' && __DEV__ ? String(Date.now()) : null;

const normalizeAbsoluteUrl = (value: string): string => {
  try {
    const url = new URL(value);
    if (
      FORCE_HTTPS &&
      url.protocol === 'http:' &&
      BACKEND_HOST &&
      url.host === BACKEND_HOST
    ) {
      url.protocol = 'https:';
      return url.toString();
    }
  } catch {
    // fall through
  }
  return value;
};

const appendMediaCacheBust = (value: string): string => {
  if (!DEBUG_MEDIA_VERSION) {
    return value;
  }
  try {
    const url = new URL(value);
    if (!url.pathname.startsWith('/media/')) {
      return value;
    }
    if (!url.searchParams.has('v')) {
      url.searchParams.set('v', DEBUG_MEDIA_VERSION);
    }
    return url.toString();
  } catch {
    return value;
  }
};

export function resolveBackendUrl(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  if (/^https?:\/\//i.test(value)) {
    return appendMediaCacheBust(normalizeAbsoluteUrl(value));
  }
  if (value.startsWith('/')) {
    return appendMediaCacheBust(`${BACKEND_BASE}${value}`);
  }
  if (!BACKEND_BASE) {
    return value;
  }
  return appendMediaCacheBust(`${BACKEND_BASE}/${value}`);
}
