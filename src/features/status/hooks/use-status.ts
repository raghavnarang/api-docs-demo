import { useQuery } from '@tanstack/react-query'
import { getDataSource } from '../../../lib/data/data-source'
import { queryKeys } from '../../../lib/data/query-keys'

/**
 * TanStack Query hooks for API Status (§2.6). Unaware of the backing data source
 * — they only know the `ApiStatusRepository` contract resolved via
 * `getDataSource()`. Swapping `appConfig.dataSource` to a REST status backend
 * needs no change here.
 *
 * Status is global infra health (not user-scoped), so there is no token and no
 * per-account cache partition.
 */
const statusRepo = () => getDataSource().status

/** Status for a single API — drives its dedicated status page. */
export function useApiStatus(apiId: string) {
  return useQuery({
    queryKey: queryKeys.status.api(apiId),
    queryFn: () => statusRepo().getApiStatus(apiId),
    enabled: apiId.length > 0,
  })
}

/**
 * Site-wide banner messages — a separate query from per-API status, powering the
 * always-mounted incident banner independently of which API page is open.
 */
export function useStatusBanner() {
  return useQuery({
    queryKey: queryKeys.status.banner(),
    queryFn: () => statusRepo().getStatusBanner(),
  })
}
