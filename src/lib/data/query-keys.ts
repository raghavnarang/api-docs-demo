/**
 * Centralized TanStack Query key factory. Feature hooks key their queries here
 * so cache invalidation stays consistent. Extend per domain as features land.
 */
export const queryKeys = {
  apis: {
    all: ['apis'] as const,
    list: () => [...queryKeys.apis.all, 'list'] as const,
  },
} as const
