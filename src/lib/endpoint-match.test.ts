import { describe, expect, test } from 'vitest'
import type { EndpointDef } from './spec-parser'
import { endpointMatchesQuery } from './endpoint-match'

const endpoint: EndpointDef = {
  id: 'listPokemon',
  method: 'get',
  path: '/api/v2/pokemon',
  summary: 'List Pokémon',
  description: 'Returns a paginated list of creatures.',
  params: [
    { name: 'offset', in: 'query', required: false, type: 'integer' },
    { name: 'limit', in: 'query', required: false, description: 'Page size' },
  ],
  responses: [],
}

describe('endpointMatchesQuery', () => {
  test('matches on path', () => {
    expect(endpointMatchesQuery(endpoint, 'pokemon')).toBe(true)
  })

  test('matches on description', () => {
    expect(endpointMatchesQuery(endpoint, 'creatures')).toBe(true)
  })

  test('matches on a parameter name', () => {
    expect(endpointMatchesQuery(endpoint, 'offset')).toBe(true)
  })

  test('matches on a parameter description', () => {
    expect(endpointMatchesQuery(endpoint, 'page size')).toBe(true)
  })

  test('is case-insensitive', () => {
    expect(endpointMatchesQuery(endpoint, 'POKÉMON')).toBe(true)
  })

  test('returns false on no match', () => {
    expect(endpointMatchesQuery(endpoint, 'invoice')).toBe(false)
  })

  test('returns false for an empty/whitespace query', () => {
    expect(endpointMatchesQuery(endpoint, '   ')).toBe(false)
  })
})
