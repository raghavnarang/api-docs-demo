import { describe, expect, test } from 'vitest'
import type { EndpointDef } from '../../../lib/spec-parser'
import { groupEndpoints, resourceOf } from './group-endpoints'

describe('resourceOf', () => {
  test('uses the last non-parameter path segment', () => {
    expect(resourceOf('/api/v2/pokemon/{id}/')).toBe('pokemon')
    expect(resourceOf('/cards/{cardId}')).toBe('cards')
    expect(resourceOf('/payments')).toBe('payments')
    expect(resourceOf('/payments/{id}')).toBe('payments')
  })
})

describe('groupEndpoints', () => {
  test('buckets endpoints by resource, preserving order', () => {
    const eps = [
      { id: 'a', method: 'get', path: '/payments', params: [], responses: [] },
      { id: 'b', method: 'post', path: '/payments', params: [], responses: [] },
      {
        id: 'c',
        method: 'get',
        path: '/cards/{id}',
        params: [],
        responses: [],
      },
    ] as EndpointDef[]

    const groups = groupEndpoints(eps)
    expect(groups.map((g) => g.resource)).toEqual(['payments', 'cards'])
    expect(groups[0].endpoints.map((e) => e.id)).toEqual(['a', 'b'])
    expect(groups[1].endpoints.map((e) => e.id)).toEqual(['c'])
  })
})
