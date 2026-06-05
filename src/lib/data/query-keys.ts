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
    docs: (id: string) => [...queryKeys.apis.all, 'docs', id] as const,
    errors: (id: string) => [...queryKeys.apis.all, 'errors', id] as const,
    search: (query: string) =>
      [...queryKeys.apis.all, 'search', query] as const,
  },
} as const
