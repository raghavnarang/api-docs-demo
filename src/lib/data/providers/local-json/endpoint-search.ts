import type { OpenAPIV3 } from 'openapi-types'
import { parseOpenApiSpec } from '../../../spec-parser'
import type { EndpointSearchResult } from '../../types'

export interface SearchableApi {
  id: string
  name: string
  spec: OpenAPIV3.Document
}

/**
 * In-memory endpoint search — the local-json adapter's implementation of
 * `searchEndpoints`. Matches across the three §2.2 fields: endpoints
 * (method/path/id), descriptions (summary + description), and parameters
 * (name + description), via case-insensitive substring match. A backend-backed
 * adapter (rest/graphql) would delegate search to the server instead.
 */
export function searchEndpoints(
  apis: SearchableApi[],
  query: string,
): EndpointSearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const results: EndpointSearchResult[] = []
  for (const api of apis) {
    for (const endpoint of parseOpenApiSpec(api.spec)) {
      const haystacks: (string | undefined)[] = [
        endpoint.method,
        endpoint.path,
        endpoint.id,
        endpoint.summary,
        endpoint.description,
        ...endpoint.params.flatMap((p) => [p.name, p.description]),
      ]
      if (haystacks.some((h) => h?.toLowerCase().includes(q))) {
        results.push({ apiId: api.id, apiName: api.name, endpoint })
      }
    }
  }
  return results
}
