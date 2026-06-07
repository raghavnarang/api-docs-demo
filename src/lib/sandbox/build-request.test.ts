import { describe, expect, test } from 'vitest'
import { buildRequest, tryParseJson, type SandboxFormState } from './build-request'
import type { EndpointDef } from '../spec-parser'

function endpoint(overrides: Partial<EndpointDef> = {}): EndpointDef {
  return {
    id: 'op',
    method: 'get',
    path: '/pokemon/{name}',
    params: [],
    responses: [],
    ...overrides,
  }
}

function form(overrides: Partial<SandboxFormState> = {}): SandboxFormState {
  return { pathParams: [], queryParams: [], headers: [], body: '', ...overrides }
}

describe('buildRequest', () => {
  test('substitutes and URL-encodes path params; uppercases the method', () => {
    const req = buildRequest({
      endpoint: endpoint(),
      baseUrl: 'https://pokeapi.co/api/v2',
      form: form({
        pathParams: [{ key: 'name', value: 'pika chu', enabled: true }],
      }),
      injectAuth: false,
    })
    expect(req.method).toBe('GET')
    expect(req.url).toBe('https://pokeapi.co/api/v2/pokemon/pika%20chu')
  })

  test('leaves the token visible when a path param is unfilled', () => {
    const req = buildRequest({
      endpoint: endpoint(),
      baseUrl: 'https://pokeapi.co/api/v2',
      form: form({ pathParams: [{ key: 'name', value: '', enabled: true }] }),
      injectAuth: false,
    })
    expect(req.url).toBe('https://pokeapi.co/api/v2/pokemon/{name}')
  })

  test('joins base + path safely regardless of slashes', () => {
    const req = buildRequest({
      endpoint: endpoint({ path: 'pokemon' }),
      baseUrl: 'https://pokeapi.co/api/v2/',
      form: form(),
      injectAuth: false,
    })
    expect(req.url).toBe('https://pokeapi.co/api/v2/pokemon')
  })

  test('appends only enabled, non-empty-key query params', () => {
    const req = buildRequest({
      endpoint: endpoint({ path: '/pokemon' }),
      baseUrl: 'https://x.test',
      form: form({
        queryParams: [
          { key: 'limit', value: '20', enabled: true },
          { key: 'offset', value: '0', enabled: false },
          { key: '', value: 'orphan', enabled: true },
        ],
      }),
      injectAuth: false,
    })
    expect(req.url).toBe('https://x.test/pokemon?limit=20')
  })

  test('merges enabled headers and injects the bearer token when asked', () => {
    const req = buildRequest({
      endpoint: endpoint(),
      baseUrl: 'https://x.test',
      form: form({
        headers: [{ key: 'X-Trace', value: 'abc', enabled: true }],
      }),
      authToken: 'tok123',
      injectAuth: true,
    })
    expect(req.headers).toEqual({
      'X-Trace': 'abc',
      Authorization: 'Bearer tok123',
    })
  })

  test('does not inject when toggle off or token absent', () => {
    const off = buildRequest({
      endpoint: endpoint(),
      baseUrl: 'https://x.test',
      form: form(),
      authToken: 'tok',
      injectAuth: false,
    })
    expect(off.headers).toBeUndefined()
  })

  test('never overrides a user-set Authorization header', () => {
    const req = buildRequest({
      endpoint: endpoint(),
      baseUrl: 'https://x.test',
      form: form({
        headers: [{ key: 'authorization', value: 'Bearer mine', enabled: true }],
      }),
      authToken: 'tok',
      injectAuth: true,
    })
    expect(req.headers).toEqual({ authorization: 'Bearer mine' })
  })

  test('parses a JSON body for non-GET methods', () => {
    const req = buildRequest({
      endpoint: endpoint({ method: 'post', path: '/payments' }),
      baseUrl: 'https://x.test',
      form: form({ body: '{ "amount": 100 }' }),
      injectAuth: false,
    })
    expect(req.body).toEqual({ amount: 100 })
  })

  test('omits the body for GET even when text is present', () => {
    const req = buildRequest({
      endpoint: endpoint(),
      baseUrl: 'https://x.test',
      form: form({ body: '{ "x": 1 }' }),
      injectAuth: false,
    })
    expect(req.body).toBeUndefined()
  })
})

describe('tryParseJson', () => {
  test('treats empty text as valid with no value', () => {
    expect(tryParseJson('   ')).toEqual({ ok: true, value: undefined })
  })

  test('reports invalid JSON without throwing', () => {
    const result = tryParseJson('{ bad')
    expect(result.ok).toBe(false)
    expect(result.error).toBeTruthy()
  })
})
