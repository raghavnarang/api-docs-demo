import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import type { EndpointDef } from '../../../lib/spec-parser'
import { endpointMatchesQuery } from '../../../lib/endpoint-match'
import { useDebouncedValue } from '../../../lib/hooks/use-debounced-value'
import { endpointsQueryOptions, useApiSearch } from './use-catalog'

/** Matching endpoints for one API, ready to render as a grouped result list. */
export interface ApiEndpointMatches {
  apiId: string
  apiName: string
  endpoints: EndpointDef[]
}

/**
 * Two-tier global search for the Cmd/Ctrl+K dialog.
 *
 * - **Tier 2** (`useApiSearch` → DAL `searchApis`): which APIs contain the keyword,
 *   id-agnostic (raw spec scan for local-json, a backend call for REST). No parse.
 * - **Tier 1** (`endpointMatchesQuery`): the precise per-endpoint match that yields
 *   the anchor ids. It runs over each matched API's parsed endpoints, pulled via
 *   `useQueries` on the *shared* `endpointsQueryOptions` key — so a spec parsed for
 *   the docs page is reused here (no re-parse), and one parsed here is reused by the
 *   docs page later. The parse happens at most once per API; the DAL never parses.
 */
export function useGlobalSearch(rawQuery: string) {
  const debounced = useDebouncedValue(rawQuery)
  const q = debounced.trim()

  const search = useApiSearch(q)
  const hits = useMemo(() => search.data ?? [], [search.data])

  const endpointQueries = useQueries({
    queries: hits.map((hit) => endpointsQueryOptions(hit.apiId)),
  })

  const groups = useMemo(() => {
    const out: ApiEndpointMatches[] = []
    hits.forEach((hit, i) => {
      const endpoints = endpointQueries[i]?.data
      if (!endpoints) return
      const matched = endpoints.filter((e) => endpointMatchesQuery(e, q))
      if (matched.length) {
        out.push({ apiId: hit.apiId, apiName: hit.apiName, endpoints: matched })
      }
    })
    return out
  }, [hits, endpointQueries, q])

  // Skeleton only while there's nothing to show yet; cached parses resolve instantly.
  const isLoading =
    q.length > 0 &&
    groups.length === 0 &&
    (search.isLoading || endpointQueries.some((r) => r.isLoading))
  const isError = search.isError || endpointQueries.some((r) => r.isError)

  return { groups, isLoading, isError, debounced: q }
}
