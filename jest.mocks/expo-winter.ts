if (typeof globalThis.fetch !== 'function') {
  globalThis.fetch = async () => ({ ok: true, status: 200 }) as Response;
}

if (typeof globalThis.Headers !== 'function') {
  class HeadersShim {
    private readonly map = new Map<string, string>();
    append(key: string, value: string) {
      this.map.set(key.toLowerCase(), value);
    }
  }
  // @ts-expect-error Assigning shim in test env
  globalThis.Headers = HeadersShim;
}

export const installGlobal = () => undefined;
export const runtime = {};
