import type { EndpointDef } from './spec-parser'

/**
 * Tier-1 endpoint matcher: does this already-parsed endpoint match the query?
 * Case-insensitive substring across the three §2.2 fields — endpoint
 * (method/path/id), descriptions (summary + description), and parameters
 * (name + description). Operates on a parsed `EndpointDef`, so it never re-parses
 * a spec; the frontend runs it over its cached endpoints (see `useGlobalSearch`).
 */
export function endpointMatchesQuery(
  endpoint: EndpointDef,
  query: string,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return false

  const haystacks: (string | undefined)[] = [
    endpoint.method,
    endpoint.path,
    endpoint.id,
    endpoint.summary,
    endpoint.description,
    ...endpoint.params.flatMap((p) => [p.name, p.description]),
  ]
  return haystacks.some((h) => h?.toLowerCase().includes(q))
}
