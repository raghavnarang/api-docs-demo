import { useQuery } from '@tanstack/react-query'
import { getDataSource } from '../../../lib/data/data-source'
import { queryKeys } from '../../../lib/data/query-keys'

/**
 * Feature hook for the Changelog (§2.7). Fetches one API's changelog at a time
 * — the selected API drives the fetch, mirroring how the Sandbox fetches per
 * selection. Data-source-agnostic: it only knows the `ApiCatalogRepository`
 * contract resolved via `getDataSource()`. Gated on a non-empty `apiId`.
 */
const catalog = () => getDataSource().catalog

export function useApiChangelog(apiId: string) {
  return useQuery({
    queryKey: queryKeys.apis.changelog(apiId),
    queryFn: () => catalog().getChangelog(apiId),
    enabled: apiId.length > 0,
  })
}
