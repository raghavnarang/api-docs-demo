import type { EndpointDef } from '../../../lib/spec-parser'

/**
 * Derives a resource group label for an endpoint from its path: the last
 * non-parameter segment (e.g. `/api/v2/pokemon/{id}/` → "pokemon",
 * `/cards/{cardId}` → "cards"). Keeps the docs TOC organised without needing
 * tags in the spec.
 */
export function resourceOf(path: string): string {
  const segments = path
    .split('/')
    .filter((s) => s.length > 0 && !s.startsWith('{'))
  return segments[segments.length - 1] ?? '/'
}

export interface EndpointGroup {
  resource: string
  endpoints: EndpointDef[]
}

/** Groups endpoints by resource, preserving first-seen order of both. */
export function groupEndpoints(endpoints: EndpointDef[]): EndpointGroup[] {
  const groups = new Map<string, EndpointDef[]>()
  for (const ep of endpoints) {
    const key = resourceOf(ep.path)
    const bucket = groups.get(key)
    if (bucket) bucket.push(ep)
    else groups.set(key, [ep])
  }
  return [...groups.entries()].map(([resource, eps]) => ({
    resource,
    endpoints: eps,
  }))
}
