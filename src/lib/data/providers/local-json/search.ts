import type { OpenAPIV3 } from 'openapi-types'

/**
 * Tier-2 spec scan for the local-json adapter. With no backend in hand, "which
 * APIs contain this keyword" is answered by a cheap raw substring scan over the
 * bundled spec JSON — deliberately *without* parsing into endpoints (anchor ids
 * are a frontend concern). A REST adapter replaces this with a server call.
 *
 * Over-matching (e.g. hitting a component schema name) is harmless: the frontend
 * Tier-1 matcher (`endpointMatchesQuery`) is the precise display gate, so an API
 * with no endpoint-level hit simply renders no rows.
 */
export function specMatchesQuery(
  spec: OpenAPIV3.Document,
  query: string,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return false
  return JSON.stringify(spec).toLowerCase().includes(q)
}
