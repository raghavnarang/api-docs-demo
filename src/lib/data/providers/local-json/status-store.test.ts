import { describe, expect, it } from 'vitest'
import type { OpenAPIV3 } from 'openapi-types'
import type { ApiDefinition } from '../../../../apis/api-registry'
import { getApiStatus, getStatusBanner } from './status-store'

const spec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: { title: 't', version: '1' },
  paths: { '/ping': { get: { responses: {} } } },
}

const REGISTRY: ApiDefinition[] = [
  { id: 'alpha', name: 'Alpha', version: '1', baseUrl: 'https://a.test', spec },
  { id: 'beta', name: 'Beta', version: '2', baseUrl: 'https://b.test', spec },
  { id: 'gamma', name: 'Gamma', version: '3', baseUrl: 'https://g.test', spec },
]

describe('getApiStatus', () => {
  it('is deterministic for the same API', () => {
    expect(getApiStatus('alpha', REGISTRY)).toEqual(
      getApiStatus('alpha', REGISTRY),
    )
  })

  it('returns null for an unknown API', () => {
    expect(getApiStatus('nope', REGISTRY)).toBeNull()
  })

  it('preserves the API id and name', () => {
    const status = getApiStatus('beta', REGISTRY)!
    expect(status.apiId).toBe('beta')
    expect(status.apiName).toBe('Beta')
  })

  it('produces a 90-day uptime series, oldest first, in ISO date format', () => {
    const status = getApiStatus('alpha', REGISTRY)!
    expect(status.days).toHaveLength(90)
    for (const day of status.days) {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(day.uptime).toBeGreaterThanOrEqual(0)
      expect(day.uptime).toBeLessThanOrEqual(1)
    }
    const dates = status.days.map((d) => d.date)
    expect([...dates].sort()).toEqual(dates)
  })

  it('uptime90d equals the mean of the daily series and is within 0..1', () => {
    for (const api of REGISTRY) {
      const status = getApiStatus(api.id, REGISTRY)!
      const mean =
        status.days.reduce((s, d) => s + d.uptime, 0) / status.days.length
      expect(status.uptime90d).toBeCloseTo(mean, 5)
      expect(status.uptime90d).toBeGreaterThanOrEqual(0)
      expect(status.uptime90d).toBeLessThanOrEqual(1)
    }
  })

  it('derives health from active incidents (worst impact, else operational)', () => {
    for (const api of REGISTRY) {
      const status = getApiStatus(api.id, REGISTRY)!
      const active = status.incidents.filter((i) => i.status === 'active')
      if (status.health === 'operational') {
        expect(active).toHaveLength(0)
      } else if (status.health === 'outage') {
        expect(active.some((i) => i.impact === 'outage')).toBe(true)
      } else {
        expect(active.length).toBeGreaterThan(0)
        expect(active.every((i) => i.impact === 'degraded')).toBe(true)
      }
    }
  })

  it('lists incidents newest first', () => {
    const { incidents } = getApiStatus('gamma', REGISTRY)!
    const starts = incidents.map((i) => i.startedAt)
    expect([...starts].sort().reverse()).toEqual(starts)
  })

  it('resolved incidents carry resolvedAt + a Resolved update; active ones do not', () => {
    for (const api of REGISTRY) {
      for (const inc of getApiStatus(api.id, REGISTRY)!.incidents) {
        expect(inc.updates.length).toBeGreaterThan(0)
        // Updates are newest first.
        const ts = inc.updates.map((u) => u.timestamp)
        expect([...ts].sort().reverse()).toEqual(ts)
        const hasResolved = inc.updates.some((u) => u.status === 'Resolved')
        if (inc.status === 'resolved') {
          expect(inc.resolvedAt).not.toBeNull()
          expect(hasResolved).toBe(true)
          expect(new Date(inc.resolvedAt!).getTime()).toBeGreaterThanOrEqual(
            new Date(inc.startedAt).getTime(),
          )
        } else {
          expect(inc.resolvedAt).toBeNull()
          expect(hasResolved).toBe(false)
        }
      }
    }
  })
})

describe('getStatusBanner', () => {
  it('is deterministic', () => {
    expect(getStatusBanner(REGISTRY)).toEqual(getStatusBanner(REGISTRY))
  })

  it('emits one message per non-operational API and none for operational ones', () => {
    const banner = getStatusBanner(REGISTRY)
    for (const api of REGISTRY) {
      const health = getApiStatus(api.id, REGISTRY)!.health
      const msg = banner.find((m) => m.apiId === api.id)
      if (health === 'operational') {
        expect(msg).toBeUndefined()
      } else {
        expect(msg).toBeDefined()
        expect(msg!.level).toBe(health)
        expect(msg!.message).toContain(api.name)
      }
    }
  })
})
