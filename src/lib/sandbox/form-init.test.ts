import { describe, expect, test } from 'vitest'
import { initialBody, initialFormState } from './form-init'
import type { EndpointDef } from '../spec-parser'

const endpoint: EndpointDef = {
  id: 'createPayment',
  method: 'post',
  path: '/payments/{id}',
  params: [
    { name: 'id', in: 'path', required: true },
    { name: 'expand', in: 'query', required: false },
    { name: 'X-Key', in: 'header', required: false },
  ],
  requestBody: {
    required: true,
    contentTypes: ['application/json'],
    schema: {
      type: 'object',
      properties: [
        { name: 'amount', schema: { type: 'integer', required: true } },
        { name: 'currency', schema: { type: 'string', default: 'usd' } },
        { name: 'id', schema: { type: 'string', readOnly: true } },
      ],
    },
  },
  responses: [],
}

describe('initialFormState', () => {
  test('seeds rows grouped by param location', () => {
    const state = initialFormState(endpoint)
    expect(state.pathParams).toEqual([{ key: 'id', value: '', enabled: true }])
    expect(state.queryParams).toEqual([
      { key: 'expand', value: '', enabled: true },
    ])
    expect(state.headers).toEqual([{ key: 'X-Key', value: '', enabled: true }])
  })
})

describe('initialBody', () => {
  test('builds a JSON skeleton, prefers defaults, and drops readOnly fields', () => {
    const body = JSON.parse(initialBody(endpoint))
    expect(body).toEqual({ amount: 0, currency: 'usd' })
    expect(body).not.toHaveProperty('id')
  })

  test('returns empty string when the endpoint has no request body', () => {
    expect(initialBody({ ...endpoint, requestBody: undefined })).toBe('')
  })

  test('seeds arrays from their item schema', () => {
    const arr: EndpointDef = {
      ...endpoint,
      requestBody: {
        required: true,
        contentTypes: ['application/json'],
        schema: { type: 'array', items: { type: 'string' } },
      },
    }
    expect(JSON.parse(initialBody(arr))).toEqual([''])
  })
})
