import { useQuery } from '@tanstack/react-query'
import { getDataSource } from '../../../lib/data/data-source'
import { queryKeys } from '../../../lib/data/query-keys'

/**
 * Feature hooks for API Catalogue & Documentation (§2.2). Each wraps a
 * data-source-agnostic repository call in TanStack Query — components consume
 * these, never the data source directly.
 */

const catalog = () => getDataSource().catalog

export function useApis() {
  return useQuery({
    queryKey: queryKeys.apis.list(),
    queryFn: () => catalog().listApis(),
  })
}

export function useApi(id: string) {
  return useQuery({
    queryKey: queryKeys.apis.detail(id),
    queryFn: () => catalog().getApi(id),
  })
}

export function useApiSpec(id: string) {
  return useQuery({
    queryKey: queryKeys.apis.spec(id),
    queryFn: () => catalog().getSpec(id),
  })
}

export function useApiDocs(id: string) {
  return useQuery({
    queryKey: queryKeys.apis.docs(id),
    queryFn: () => catalog().getDocs(id),
  })
}

export function useErrorReference(id: string) {
  return useQuery({
    queryKey: queryKeys.apis.errors(id),
    queryFn: () => catalog().getErrorReference(id),
  })
}

/**
 * Endpoint search. Pass an already-debounced query (see `useDebouncedValue`);
 * disabled while the query is empty.
 */
export function useEndpointSearch(debouncedQuery: string) {
  return useQuery({
    queryKey: queryKeys.apis.search(debouncedQuery),
    queryFn: () => catalog().searchEndpoints(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  })
}
