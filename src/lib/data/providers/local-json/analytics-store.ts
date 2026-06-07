import { API_REGISTRY, type ApiDefinition } from '../../../../apis/api-registry'
import type {
  EndpointUsage,
  UsageReport,
  UsageSummary,
  UsageTimePoint,
  UsageWindow,
} from '../../types'

/**
 * Deterministic mocked usage analytics for the local-json adapter (§2.5). Pure
 * of React — the adapter calls `getKeyUsage` after resolving the owner from the
 * token.
 *
 * Metrics are generated from a seeded PRNG keyed on `owner:keyId:window`, so the
 * same key+window always yields the same report across re-renders, refetches,
 * and reloads (no flicker), while different keys/windows/owners differ. A REST
 * adapter would instead return real numbers from a metrics backend — same shape.
 */

/** xfnv1a string hash → 32-bit seed. */
function hashSeed(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** mulberry32 PRNG — small, fast, deterministic; returns floats in [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Random integer in [min, max], inclusive. */
function randInt(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1))
}

/** ISO `YYYY-MM-DD` for `daysAgo` days before `today`. */
function isoDate(today: Date, daysAgo: number): string {
  const d = new Date(today)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

/**
 * Pull up to `limit` (method, path) pairs from the registered specs so the
 * per-endpoint breakdown reflects real registered APIs — no endpoint data is
 * hardcoded here. Iterates APIs round-tripping their first paths.
 */
export function extractEndpoints(
  registry: ApiDefinition[],
  limit = 6,
): { method: string; path: string }[] {
  const out: { method: string; path: string }[] = []
  for (const api of registry) {
    const paths = api.spec.paths ?? {}
    for (const [path, item] of Object.entries(paths)) {
      if (!item) continue
      for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
        if (method in item) {
          out.push({ method: method.toUpperCase(), path })
          if (out.length >= limit) return out
          break // one method per path keeps the breakdown varied
        }
      }
    }
  }
  return out
}

/**
 * Generate a deterministic usage report for a key over a window.
 *
 * @param endpoints injected from the active registry (testability); defaults to
 *   the bundled `API_REGISTRY`.
 */
export function getKeyUsage(
  owner: string,
  keyId: string,
  window: UsageWindow,
  endpoints: { method: string; path: string }[] = extractEndpoints(
    API_REGISTRY,
  ),
): UsageReport {
  const rand = mulberry32(hashSeed(`${owner}:${keyId}:${window}`))
  const days = window === '7d' ? 7 : 30
  const today = new Date()

  // --- Time-series: one point per day, oldest first. ---
  const series: UsageTimePoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const calls = randInt(rand, 200, 1000)
    const errors = Math.round(calls * rand() * 0.08) // up to ~8% errors/day
    const avgLatencyMs = randInt(rand, 80, 300)
    series.push({ date: isoDate(today, i), calls, errors, avgLatencyMs })
  }

  // --- Summary: aggregate the series. ---
  const totalCalls = series.reduce((sum, p) => sum + p.calls, 0)
  const totalErrors = series.reduce((sum, p) => sum + p.errors, 0)
  // Seeded split of errors into 4xx (the majority) vs 5xx.
  const errors4xx = Math.round(totalErrors * (0.6 + rand() * 0.3))
  const errors5xx = totalErrors - errors4xx
  const latencyWeighted = series.reduce(
    (sum, p) => sum + p.avgLatencyMs * p.calls,
    0,
  )
  const summary: UsageSummary = {
    totalCalls,
    errors4xx,
    errors5xx,
    errorRate: totalCalls === 0 ? 0 : totalErrors / totalCalls,
    avgLatencyMs: totalCalls === 0 ? 0 : Math.round(latencyWeighted / totalCalls),
  }

  // --- Per-endpoint breakdown: distribute totalCalls by seeded weights, with
  // the remainder assigned to the last row so the sum reconciles exactly. ---
  const breakdown: EndpointUsage[] = []
  if (endpoints.length > 0) {
    const weights = endpoints.map(() => rand() + 0.1)
    const weightSum = weights.reduce((s, w) => s + w, 0)
    let assigned = 0
    endpoints.forEach((ep, idx) => {
      const isLast = idx === endpoints.length - 1
      const calls = isLast
        ? totalCalls - assigned
        : Math.floor((weights[idx] / weightSum) * totalCalls)
      assigned += calls
      breakdown.push({
        method: ep.method,
        path: ep.path,
        calls,
        errorRate: Number((rand() * 0.1).toFixed(4)),
        avgLatencyMs: randInt(rand, 80, 300),
      })
    })
  }

  return { keyId, window, summary, series, endpoints: breakdown }
}
