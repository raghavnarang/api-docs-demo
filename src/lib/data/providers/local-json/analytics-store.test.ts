import { describe, expect, it } from 'vitest'
import type { OpenAPIV3 } from 'openapi-types'
import type { ApiDefinition } from '../../../../apis/api-registry'
import { extractEndpoints, getKeyUsage } from './analytics-store'

const ENDPOINTS = [
  { method: 'GET', path: '/a' },
  { method: 'POST', path: '/b' },
  { method: 'GET', path: '/c' },
]

describe('getKeyUsage', () => {
  it('is deterministic for the same owner+key+window', () => {
    const a = getKeyUsage('owner-1', 'key-1', '7d', ENDPOINTS)
    const b = getKeyUsage('owner-1', 'key-1', '7d', ENDPOINTS)
    expect(a).toEqual(b)
  })

  it('differs by key, owner, and window', () => {
    const base = getKeyUsage('owner-1', 'key-1', '7d', ENDPOINTS)
    expect(getKeyUsage('owner-1', 'key-2', '7d', ENDPOINTS)).not.toEqual(base)
    expect(getKeyUsage('owner-2', 'key-1', '7d', ENDPOINTS)).not.toEqual(base)
    expect(getKeyUsage('owner-1', 'key-1', '30d', ENDPOINTS)).not.toEqual(base)
  })

  it('produces one series point per day in the window', () => {
    expect(getKeyUsage('o', 'k', '7d', ENDPOINTS).series).toHaveLength(7)
    expect(getKeyUsage('o', 'k', '30d', ENDPOINTS).series).toHaveLength(30)
  })

  it('series dates are ascending and ISO `YYYY-MM-DD`', () => {
    const { series } = getKeyUsage('o', 'k', '7d', ENDPOINTS)
    for (const point of series) {
      expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
    const dates = series.map((p) => p.date)
    expect([...dates].sort()).toEqual(dates)
  })

  it('summary reconciles with the series', () => {
    const { summary, series } = getKeyUsage('o', 'k', '30d', ENDPOINTS)
    const totalCalls = series.reduce((s, p) => s + p.calls, 0)
    const totalErrors = series.reduce((s, p) => s + p.errors, 0)
    expect(summary.totalCalls).toBe(totalCalls)
    expect(summary.errors4xx + summary.errors5xx).toBe(totalErrors)
    expect(summary.errorRate).toBeCloseTo(totalErrors / totalCalls, 10)
  })

  it('per-endpoint calls sum exactly to total calls', () => {
    const report = getKeyUsage('o', 'k', '7d', ENDPOINTS)
    const sum = report.endpoints.reduce((s, e) => s + e.calls, 0)
    expect(sum).toBe(report.summary.totalCalls)
    expect(report.endpoints).toHaveLength(ENDPOINTS.length)
  })

  it('uses the bundled registry when no endpoints are injected', () => {
    const report = getKeyUsage('o', 'k', '7d')
    expect(report.endpoints.length).toBeGreaterThan(0)
  })
})

describe('extractEndpoints', () => {
  const specWith = (paths: OpenAPIV3.PathsObject): OpenAPIV3.Document => ({
    openapi: '3.0.0',
    info: { title: 't', version: '1' },
    paths,
  })
  const registry: ApiDefinition[] = [
    {
      id: 'x',
      name: 'X',
      version: '1',
      baseUrl: 'https://x.test',
      spec: specWith({
        '/users': { get: { responses: {} }, post: { responses: {} } },
        '/orders': { delete: { responses: {} } },
      }),
    },
  ]

  it('pulls one method per path, uppercased', () => {
    expect(extractEndpoints(registry)).toEqual([
      { method: 'GET', path: '/users' },
      { method: 'DELETE', path: '/orders' },
    ])
  })

  it('respects the limit', () => {
    expect(extractEndpoints(registry, 1)).toEqual([
      { method: 'GET', path: '/users' },
    ])
  })
})
