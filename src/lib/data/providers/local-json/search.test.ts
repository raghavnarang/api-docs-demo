import { describe, expect, test } from 'vitest'
import type { OpenAPIV3 } from 'openapi-types'
import type { ApiDefinition } from '../../../../apis/api-registry'
import { createLocalJsonDataSource } from './index'

const spec = (summary: string): OpenAPIV3.Document => ({
  openapi: '3.0.0',
  info: { title: 't', version: '1.0.0' },
  paths: { '/things': { get: { summary, responses: {} } } },
})

const registry: ApiDefinition[] = [
  {
    id: 'pokeapi',
    name: 'PokéAPI',
    version: '2.0.0',
    baseUrl: 'https://pokeapi.co',
    spec: spec('List pokemon'),
  },
  {
    id: 'stub-payments',
    name: 'Stub Payments',
    version: '1.0.0',
    baseUrl: 'https://pay.test',
    spec: spec('Create an invoice'),
  },
]

describe('local-json searchApis (Tier-2, id-agnostic)', () => {
  const { catalog } = createLocalJsonDataSource(registry)

  test('returns only APIs whose spec contains the keyword', async () => {
    const hits = await catalog.searchApis('pokemon')
    expect(hits).toEqual([{ apiId: 'pokeapi', apiName: 'PokéAPI' }])
  })

  test('is case-insensitive and matches across APIs', async () => {
    const hits = await catalog.searchApis('INVOICE')
    expect(hits.map((h) => h.apiId)).toEqual(['stub-payments'])
  })

  test('hits are id-agnostic — no endpoint field', async () => {
    const [hit] = await catalog.searchApis('pokemon')
    expect(Object.keys(hit).sort()).toEqual(['apiId', 'apiName'])
  })

  test('empty / whitespace query returns nothing', async () => {
    expect(await catalog.searchApis('')).toEqual([])
    expect(await catalog.searchApis('   ')).toEqual([])
  })

  test('no match returns empty', async () => {
    expect(await catalog.searchApis('zzznope')).toEqual([])
  })
})
