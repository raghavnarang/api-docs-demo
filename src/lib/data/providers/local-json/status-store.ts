import { API_REGISTRY, type ApiDefinition } from '../../../../apis/api-registry'
import type {
  ApiHealth,
  ApiStatus,
  IncidentUpdate,
  StatusBannerMessage,
  StatusIncident,
  UptimeDay,
} from '../../types'

/**
 * Deterministic mocked API status for the local-json adapter (§2.6). Pure of
 * React — the adapter calls `getStatusOverview` directly (no token: status is
 * global infra health, not user-scoped).
 *
 * Each API's status is generated from a seeded PRNG keyed on `status:<apiId>`,
 * so the same API always yields the same health/uptime/incidents across
 * re-renders, refetches, and reloads (no flicker), while different APIs differ.
 * Uptime dips are kept consistent with the synthesized incidents. A REST adapter
 * would instead return real numbers from a status backend — same shape.
 */

const DAYS_WINDOW = 90

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

/** Pick one element of `arr` using the PRNG. */
function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

/** ISO `YYYY-MM-DD` for `daysAgo` days before `today`. */
function isoDate(today: Date, daysAgo: number): string {
  const d = new Date(today)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

const INCIDENT_TITLES = [
  'Elevated error rates',
  'Increased response latency',
  'Intermittent 5xx responses',
  'Partial service disruption',
  'Authentication delays',
  'Scheduled maintenance overran',
] as const

const RESOLUTION_NOTES = [
  'Root cause traced to a misconfigured upstream cache; configuration rolled back and verified.',
  'A degraded database replica was failed over; latency returned to baseline.',
  'Capacity was scaled up to absorb the traffic spike. Monitoring added.',
  'A bad deploy was reverted and a regression test added to the pipeline.',
  'Upstream provider resolved their incident; we confirmed recovery end-to-end.',
] as const

/** Worst-impact reducer: outage beats degraded beats operational. */
function worstHealth(incidents: StatusIncident[]): ApiHealth {
  const active = incidents.filter((i) => i.status === 'active')
  if (active.some((i) => i.impact === 'outage')) return 'outage'
  if (active.length > 0) return 'degraded'
  return 'operational'
}

/** Number of recent days the incident feed renders day-by-day. */
const FEED_DAYS = 14

/** Build the seeded incident feed (newest first) for one API. */
function buildIncidents(
  apiId: string,
  rand: () => number,
  today: Date,
): StatusIncident[] {
  const count = randInt(rand, 1, 3)
  // ~45% of APIs currently have an unresolved (active) incident.
  const hasActive = rand() < 0.45
  const incidents: StatusIncident[] = []

  for (let i = 0; i < count; i++) {
    // The first generated incident is the active one (most recent) when present.
    // All incidents fall inside the rendered feed window.
    const isActive = hasActive && i === 0
    const daysAgo = isActive ? randInt(rand, 0, 2) : randInt(rand, 1, FEED_DAYS - 1)
    const start = new Date(today)
    start.setDate(start.getDate() - daysAgo)
    start.setHours(randInt(rand, 0, 23), randInt(rand, 0, 59), 0, 0)

    const impact: Exclude<ApiHealth, 'operational'> =
      rand() < 0.3 ? 'outage' : 'degraded'
    const title = pick(rand, INCIDENT_TITLES)
    const durationMs = randInt(rand, 1, 36) * 3_600_000
    const end = new Date(start.getTime() + durationMs)
    const hasMonitoring = rand() < 0.6

    // Oldest → newest, then reversed for display.
    const updates: IncidentUpdate[] = [
      {
        status: 'Investigating',
        body: `We are investigating reports of ${title.toLowerCase()}.`,
        timestamp: start.toISOString(),
      },
    ]
    if (hasMonitoring) {
      updates.push({
        status: 'Monitoring',
        body: 'A fix has been implemented and we are monitoring the results.',
        timestamp: new Date(
          start.getTime() + (isActive ? 3_600_000 : durationMs * 0.5),
        ).toISOString(),
      })
    }
    if (!isActive) {
      updates.push({
        status: 'Resolved',
        body: pick(rand, RESOLUTION_NOTES),
        timestamp: end.toISOString(),
      })
    }
    updates.reverse()

    incidents.push({
      id: `${apiId}-inc-${i + 1}`,
      title,
      impact,
      status: isActive ? 'active' : 'resolved',
      startedAt: start.toISOString(),
      resolvedAt: isActive ? null : end.toISOString(),
      updates,
    })
  }

  // Newest first for the feed.
  incidents.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  return incidents
}

/** Build the 90-day uptime series, dipping the days incidents occurred on. */
function buildDays(
  incidents: StatusIncident[],
  rand: () => number,
  today: Date,
): UptimeDay[] {
  // Lowest dip wins per date (worst observed uptime that day).
  const dipByDate = new Map<string, number>()
  for (const inc of incidents) {
    const date = inc.startedAt.slice(0, 10)
    const dip =
      inc.impact === 'outage' ? rand() * 0.3 : 0.7 + rand() * 0.2
    const prev = dipByDate.get(date)
    dipByDate.set(date, prev === undefined ? dip : Math.min(prev, dip))
  }

  const days: UptimeDay[] = []
  for (let i = DAYS_WINDOW - 1; i >= 0; i--) {
    const date = isoDate(today, i)
    const dip = dipByDate.get(date)
    days.push({ date, uptime: dip === undefined ? 1 : Number(dip.toFixed(3)) })
  }
  return days
}

/** Generate the deterministic status for a single API. */
function buildApiStatus(api: ApiDefinition, today: Date): ApiStatus {
  const rand = mulberry32(hashSeed(`status:${api.id}`))
  const incidents = buildIncidents(api.id, rand, today)
  const days = buildDays(incidents, rand, today)
  const uptime90d =
    days.reduce((sum, d) => sum + d.uptime, 0) / (days.length || 1)

  return {
    apiId: api.id,
    apiName: api.name,
    health: worstHealth(incidents),
    uptime90d: Number(uptime90d.toFixed(5)),
    days,
    incidents,
  }
}

/**
 * Per-API status (§2.6). Seeded on `status:<apiId>` so it's stable across
 * reloads but varies between APIs.
 *
 * @param registry injected for testability; defaults to the bundled
 *   `API_REGISTRY`, so a newly-added stub API gets its own seeded status with no
 *   code change.
 */
export function getApiStatus(
  apiId: string,
  registry: ApiDefinition[] = API_REGISTRY,
): ApiStatus | null {
  const api = registry.find((a) => a.id === apiId)
  return api ? buildApiStatus(api, new Date()) : null
}

/** Cheap health-only derivation — reuses the same seeded incident sequence. */
function deriveHealth(api: ApiDefinition, today: Date): ApiHealth {
  const rand = mulberry32(hashSeed(`status:${api.id}`))
  return worstHealth(buildIncidents(api.id, rand, today))
}

/**
 * Site-wide banner messages (§2.6) — a SEPARATE call from per-API status, but
 * derived from the same seeds so it stays consistent with the per-API pages.
 * Emits one message per API that is currently degraded or in outage (operational
 * APIs produce nothing); a real backend could mix in arbitrary announcements.
 */
export function getStatusBanner(
  registry: ApiDefinition[] = API_REGISTRY,
): StatusBannerMessage[] {
  const today = new Date()
  const messages: StatusBannerMessage[] = []
  for (const api of registry) {
    const health = deriveHealth(api, today)
    if (health === 'operational') continue
    messages.push({
      id: `banner-${api.id}`,
      level: health,
      message:
        health === 'outage'
          ? `${api.name} is experiencing an outage.`
          : `${api.name} is experiencing degraded performance.`,
      apiId: api.id,
    })
  }
  return messages
}
