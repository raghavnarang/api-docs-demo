import { useQuery } from '@tanstack/react-query'
import { getDataSource } from '../../../lib/data/data-source'
import { queryKeys } from '../../../lib/data/query-keys'
import type { UsageWindow } from '../../../lib/data/types'
import { useAuth } from '../../../lib/auth/auth-context'

/**
 * TanStack Query hook for per-key Usage Analytics (§2.5). Unaware of the backing
 * data source — it only knows the `UsageAnalyticsRepository` contract resolved
 * via `getDataSource()`. Swapping `appConfig.dataSource` to a REST metrics
 * backend needs no change here.
 *
 * Identity is the session `token`, passed to the repository (which resolves the
 * owner behind the DAL). `session.user.id` only partitions the local query cache
 * per account; it is never sent as a fetch parameter.
 */
const analyticsRepo = () => getDataSource().analytics

export function useKeyUsage(keyId: string, window: UsageWindow) {
  const { session } = useAuth()
  return useQuery({
    queryKey: queryKeys.analytics.usage(
      session?.user.id ?? 'anonymous',
      keyId,
      window,
    ),
    queryFn: () => analyticsRepo().getKeyUsage(session!.token, keyId, window),
    enabled: !!session && keyId.length > 0,
  })
}
