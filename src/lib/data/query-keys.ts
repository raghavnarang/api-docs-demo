/**
 * Centralized TanStack Query key factory. Feature hooks key their queries here
 * so cache invalidation stays consistent.
 */
export const queryKeys = {
  apis: {
    all: ['apis'] as const,
    list: () => [...queryKeys.apis.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.apis.all, 'detail', id] as const,
    spec: (id: string) => [...queryKeys.apis.all, 'spec', id] as const,
    endpoints: (id: string) =>
      [...queryKeys.apis.all, 'endpoints', id] as const,
    docs: (id: string) => [...queryKeys.apis.all, 'docs', id] as const,
    errors: (id: string) => [...queryKeys.apis.all, 'errors', id] as const,
    search: (query: string) =>
      [...queryKeys.apis.all, 'search', query] as const,
  },
  keys: {
    all: ['keys'] as const,
    /** `owner` partitions the cache per account (never sent to the DAL). */
    list: (owner: string) => [...queryKeys.keys.all, 'list', owner] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    /** `owner` partitions the cache per account (never sent to the DAL). */
    usage: (owner: string, keyId: string, window: string) =>
      [...queryKeys.analytics.all, 'usage', owner, keyId, window] as const,
  },
} as const
