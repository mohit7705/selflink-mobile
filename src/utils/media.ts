import type { MediaAsset } from '@schemas/social';

import { resolveBackendUrl } from './backendUrl';

type MediaMeta =
  | MediaAsset['meta']
  | string
  | {
      url?: string | null;
      urls?: Record<string, unknown> | null;
    }
  | null;

type MediaLike = Pick<MediaAsset, 's3_key'> & {
  meta?: MediaMeta;
  url?: string | null;
};

const parseMaybeJson = (value: string): unknown => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (!/^[{[]/.test(trimmed)) {
    return null;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

const pickMetaUrl = (value: MediaMeta, depth = 0): string | undefined => {
  if (!value || depth > 3) {
    return undefined;
  }
  if (typeof value === 'string') {
    const parsed = parseMaybeJson(value);
    if (parsed) {
      return pickMetaUrl(parsed as MediaMeta, depth + 1);
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const candidate = pickMetaUrl(entry as MediaMeta, depth + 1);
      if (candidate) {
        return candidate;
      }
    }
    return undefined;
  }
  if (typeof value !== 'object') {
    return undefined;
  }

  const directKeys = [
    'url',
    'uri',
    'file',
    'path',
    'source',
    'src',
    'location',
    's3_key',
    'key',
  ];
  for (const key of directKeys) {
    if (key in value) {
      const candidate = (value as Record<string, unknown>)[key];
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate;
      }
      if (candidate && typeof candidate === 'object') {
        const nested = pickMetaUrl(candidate as MediaMeta, depth + 1);
        if (nested) {
          return nested;
        }
      }
    }
  }

  if ('urls' in value && value.urls && typeof value.urls === 'object') {
    const urls = value.urls as Record<string, unknown>;
    const knownKeys = ['full', 'large', 'default', 'medium', 'small', 'preview'];
    for (const key of knownKeys) {
      const candidate = urls[key];
      if (typeof candidate === 'string' && candidate.length > 0) {
        return candidate;
      }
      if (candidate && typeof candidate === 'object') {
        const nested = pickMetaUrl(candidate as MediaMeta, depth + 1);
        if (nested) {
          return nested;
        }
      }
    }
  }
  if ('meta' in value && (value as Record<string, unknown>).meta) {
    const nested = pickMetaUrl(
      (value as Record<string, unknown>).meta as MediaMeta,
      depth + 1,
    );
    if (nested) {
      return nested;
    }
  }
  return undefined;
};

export function resolveMediaUrl(media?: MediaLike | null): string | undefined {
  if (!media) {
    return undefined;
  }
  const candidate =
    pickMetaUrl(media.url ?? null) ??
    pickMetaUrl(media.meta ?? null) ??
    pickMetaUrl(media.s3_key ?? null) ??
    pickMetaUrl(media as MediaMeta);
  return resolveBackendUrl(candidate);
}

export function resolveAssetUrl(value?: unknown): string | undefined {
  const candidate = pickMetaUrl(value as MediaMeta);
  return resolveBackendUrl(candidate);
}
