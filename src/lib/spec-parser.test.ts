import { describe, expect, test } from 'vitest'
import type { OpenAPIV3 } from 'openapi-types'
import { parseOpenApiSpec, type EndpointDef } from './spec-parser'

/**
 * Minimal document builder — wraps paths (and optional component schemas) in the
 * required OpenAPI envelope so each test fixture stays focused on the bit it asserts.
 */
function makeDoc(
  paths: OpenAPIV3.PathsObject,
  schemas?: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>,
): OpenAPIV3.Document {
  return {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0.0' },
    paths,
    ...(schemas ? { components: { schemas } } : {}),
  }
}

const only = (doc: OpenAPIV3.Document): EndpointDef => parseOpenApiSpec(doc)[0]

describe('parseOpenApiSpec — schema extraction', () => {
  test('back-compat: params + body-less response parse, schema undefined', () => {
    const ep = only(
      makeDoc({
        '/pokemon/{name}': {
          get: {
            operationId: 'getPokemon',
            parameters: [
              {
                name: 'name',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Pokemon name',
              },
            ],
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )

    expect(ep.id).toBe('getPokemon')
    expect(ep.method).toBe('get')
    expect(ep.path).toBe('/pokemon/{name}')
    expect(ep.params).toEqual([
      {
        name: 'name',
        in: 'path',
        required: true,
        type: 'string',
        description: 'Pokemon name',
      },
    ])
    expect(ep.responses[0]).toMatchObject({ status: '200', description: 'OK' })
    expect(ep.responses[0].schema).toBeUndefined()
  })

  test('inline request body object: order, required flags, enum', () => {
    const ep = only(
      makeDoc({
        '/payments': {
          post: {
            operationId: 'createPayment',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['amount', 'currency'],
                    properties: {
                      amount: { type: 'integer', description: 'Minor units' },
                      currency: { type: 'string', enum: ['USD', 'EUR'] },
                      note: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
      }),
    )

    const body = ep.requestBody
    expect(body?.contentTypes).toEqual(['application/json'])
    expect(body?.required).toBe(true)
    expect(body?.schema?.type).toBe('object')

    const props = body?.schema?.properties ?? []
    expect(props.map((p) => p.name)).toEqual(['amount', 'currency', 'note'])
    expect(props[0].schema.required).toBe(true) // amount
    expect(props[1].schema.required).toBe(true) // currency
    expect(props[2].schema.required).toBe(false) // note
    expect(props[1].schema.enum).toEqual(['USD', 'EUR'])
  })

  test('response schema via $ref is resolved', () => {
    const ep = only(
      makeDoc(
        {
          '/pokemon/{name}': {
            get: {
              operationId: 'getPokemon',
              responses: {
                '200': {
                  description: 'Found',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Pokemon' },
                    },
                  },
                },
              },
            },
          },
        },
        {
          Pokemon: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
      ),
    )

    expect(ep.responses[0].status).toBe('200')
    expect(ep.responses[0].description).toBe('Found')
    const names = ep.responses[0].schema?.properties?.map((p) => p.name)
    expect(names).toEqual(['id', 'name'])
  })

  test('array schema resolves items (incl. $ref items)', () => {
    const ep = only(
      makeDoc(
        {
          '/pokemon/{name}': {
            get: {
              operationId: 'getPokemon',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          types: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/NamedAPIResource',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          NamedAPIResource: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
      ),
    )

    const types = ep.responses[0].schema?.properties?.[0].schema
    expect(types?.type).toBe('array')
    expect(types?.items?.properties?.map((p) => p.name)).toEqual([
      'name',
      'url',
    ])
  })

  test('nested objects recurse to the right depth', () => {
    const ep = only(
      makeDoc({
        '/x': {
          post: {
            operationId: 'x',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      meta: {
                        type: 'object',
                        properties: {
                          tag: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )

    const meta = ep.requestBody?.schema?.properties?.[0].schema
    expect(meta?.type).toBe('object')
    expect(meta?.properties?.[0].name).toBe('tag')
    expect(meta?.properties?.[0].schema.type).toBe('string')
  })

  test('$ref cycle is cut, not looped', () => {
    const ep = only(
      makeDoc(
        {
          '/tree': {
            get: {
              operationId: 'getTree',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Node' },
                    },
                  },
                },
              },
            },
          },
        },
        {
          Node: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              child: { $ref: '#/components/schemas/Node' },
            },
          },
        },
      ),
    )

    const root = ep.responses[0].schema
    const child = root?.properties?.find((p) => p.name === 'child')?.schema
    expect(child?.circular).toBe(true)
  })

  test('required[] only marks listed properties', () => {
    const ep = only(
      makeDoc({
        '/x': {
          post: {
            operationId: 'x',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['a'],
                    properties: {
                      a: { type: 'string' },
                      b: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )

    const props = ep.requestBody?.schema?.properties ?? []
    expect(props.find((p) => p.name === 'a')?.schema.required).toBe(true)
    expect(props.find((p) => p.name === 'b')?.schema.required).toBe(false)
  })

  test('carries format, nullable, description, example', () => {
    const ep = only(
      makeDoc({
        '/x': {
          post: {
            operationId: 'x',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                    description: 'A timestamp',
                    example: '2026-01-01T00:00:00Z',
                  },
                },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )

    expect(ep.requestBody?.schema).toMatchObject({
      type: 'string',
      format: 'date-time',
      nullable: true,
      description: 'A timestamp',
      example: '2026-01-01T00:00:00Z',
    })
  })

  test('content-type selection prefers application/json, else first', () => {
    const both = only(
      makeDoc({
        '/x': {
          post: {
            operationId: 'x',
            requestBody: {
              content: {
                'application/xml': { schema: { type: 'string' } },
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { a: { type: 'string' } },
                  },
                },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )
    expect(both.requestBody?.contentTypes).toEqual([
      'application/xml',
      'application/json',
    ])
    // schema comes from the JSON entry, not the XML one
    expect(both.requestBody?.schema?.type).toBe('object')

    const xmlOnly = only(
      makeDoc({
        '/y': {
          post: {
            operationId: 'y',
            requestBody: {
              content: { 'application/xml': { schema: { type: 'string' } } },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )
    expect(xmlOnly.requestBody?.contentTypes).toEqual(['application/xml'])
    expect(xmlOnly.requestBody?.schema?.type).toBe('string')
  })

  test('unresolvable $ref yields undefined schema, no throw', () => {
    const parse = () =>
      only(
        makeDoc({
          '/x': {
            get: {
              operationId: 'x',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/DoesNotExist' },
                    },
                  },
                },
              },
            },
          },
        }),
      )

    expect(parse).not.toThrow()
    const ep = parse()
    expect(ep.responses[0].schema).toBeUndefined()
    expect(ep.responses[0].status).toBe('200')
  })

  test('allOf merges member properties and unions required', () => {
    const ep = only(
      makeDoc(
        {
          '/account': {
            get: {
              operationId: 'getAccount',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: {
                        allOf: [
                          { $ref: '#/components/schemas/Base' },
                          {
                            type: 'object',
                            required: ['name'],
                            properties: { name: { type: 'string' } },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          Base: {
            type: 'object',
            properties: { id: { type: 'integer' } },
          },
        },
      ),
    )

    const schema = ep.responses[0].schema
    expect(schema?.type).toBe('object')
    expect(schema?.properties?.map((p) => p.name)).toEqual(['id', 'name'])
    expect(
      schema?.properties?.find((p) => p.name === 'name')?.schema.required,
    ).toBe(true)
    expect(
      schema?.properties?.find((p) => p.name === 'id')?.schema.required,
    ).toBe(false)
  })

  test('oneOf / anyOf surface as variants with a composition tag', () => {
    const oneOf = only(
      makeDoc({
        '/pay': {
          post: {
            operationId: 'pay',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    oneOf: [
                      {
                        type: 'object',
                        properties: { card: { type: 'string' } },
                      },
                      {
                        type: 'object',
                        properties: { bank: { type: 'string' } },
                      },
                    ],
                  },
                },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )
    expect(oneOf.requestBody?.schema?.composition).toBe('oneOf')
    expect(oneOf.requestBody?.schema?.variants).toHaveLength(2)
    expect(oneOf.requestBody?.schema?.variants?.[0].properties?.[0].name).toBe(
      'card',
    )

    const anyOf = only(
      makeDoc({
        '/x': {
          post: {
            operationId: 'x',
            requestBody: {
              content: {
                'application/json': {
                  schema: { anyOf: [{ type: 'string' }, { type: 'integer' }] },
                },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )
    expect(anyOf.requestBody?.schema?.composition).toBe('anyOf')
    expect(anyOf.requestBody?.schema?.variants?.map((v) => v.type)).toEqual([
      'string',
      'integer',
    ])
  })

  test('additionalProperties: typed map and free-form map', () => {
    const typed = only(
      makeDoc({
        '/x': {
          post: {
            operationId: 'x',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    additionalProperties: { type: 'number' },
                  },
                },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )
    expect(typed.requestBody?.schema?.additionalProperties?.type).toBe('number')

    const free = only(
      makeDoc({
        '/y': {
          post: {
            operationId: 'y',
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'object', additionalProperties: true },
                },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )
    // `true` → any value: a defined-but-empty node.
    expect(free.requestBody?.schema?.additionalProperties).toEqual({})
  })

  test('OpenAPI 3.1 array type collapses to single type + nullable', () => {
    const ep = only(
      makeDoc({
        '/x': {
          post: {
            operationId: 'x',
            requestBody: {
              content: {
                'application/json': {
                  // 3.1 style: type as an array including "null"
                  schema: { type: ['string', 'null'] } as never,
                },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )
    expect(ep.requestBody?.schema?.type).toBe('string')
    expect(ep.requestBody?.schema?.nullable).toBe(true)
  })

  test('carries validation constraints onto the node', () => {
    const ep = only(
      makeDoc({
        '/x': {
          post: {
            operationId: 'x',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      amount: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100000,
                        multipleOf: 1,
                        default: 100,
                      },
                      code: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 3,
                        pattern: '^[A-Z]+$',
                      },
                      tags: {
                        type: 'array',
                        items: { type: 'string' },
                        minItems: 1,
                        uniqueItems: true,
                      },
                    },
                  },
                },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )

    const props = ep.requestBody?.schema?.properties ?? []
    const amount = props.find((p) => p.name === 'amount')?.schema
    expect(amount).toMatchObject({
      minimum: 1,
      maximum: 100000,
      multipleOf: 1,
      default: 100,
    })
    const code = props.find((p) => p.name === 'code')?.schema
    expect(code).toMatchObject({
      minLength: 3,
      maxLength: 3,
      pattern: '^[A-Z]+$',
    })
    const tags = props.find((p) => p.name === 'tags')?.schema
    expect(tags).toMatchObject({ minItems: 1, uniqueItems: true })
  })

  test('carries readOnly / writeOnly flags', () => {
    const ep = only(
      makeDoc({
        '/x': {
          post: {
            operationId: 'x',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', readOnly: true },
                      secret: { type: 'string', writeOnly: true },
                    },
                  },
                },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )

    const props = ep.requestBody?.schema?.properties ?? []
    expect(props.find((p) => p.name === 'id')?.schema.readOnly).toBe(true)
    expect(props.find((p) => p.name === 'secret')?.schema.writeOnly).toBe(true)
  })

  test('captures discriminator propertyName on a oneOf union', () => {
    const ep = only(
      makeDoc({
        '/pay': {
          post: {
            operationId: 'pay',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    oneOf: [
                      {
                        type: 'object',
                        properties: {
                          kind: { type: 'string', enum: ['card'] },
                          cardNumber: { type: 'string' },
                        },
                      },
                      {
                        type: 'object',
                        properties: {
                          kind: { type: 'string', enum: ['bank'] },
                          iban: { type: 'string' },
                        },
                      },
                    ],
                    discriminator: { propertyName: 'kind' },
                  },
                },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )

    const schema = ep.requestBody?.schema
    expect(schema?.composition).toBe('oneOf')
    expect(schema?.discriminator).toBe('kind')
    // distinct variants — the discriminator (`kind`) is what tells them apart
    expect(schema?.variants?.[0].properties?.map((p) => p.name)).toEqual([
      'kind',
      'cardNumber',
    ])
    expect(schema?.variants?.[1].properties?.map((p) => p.name)).toEqual([
      'kind',
      'iban',
    ])
  })

  test('endpoint ids stay unique when operationId is reused', () => {
    const eps = parseOpenApiSpec(
      makeDoc({
        '/a': {
          get: {
            operationId: 'dup',
            responses: { '200': { description: 'OK' } },
          },
        },
        '/b': {
          get: {
            operationId: 'dup',
            responses: { '200': { description: 'OK' } },
          },
        },
      }),
    )
    const ids = eps.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual(['dup', 'dup_2'])
  })

  test('fallback slug id has no leading/trailing underscores', () => {
    const ep = only(
      makeDoc({
        '/rarities/{rarity}': {
          get: { responses: { '200': { description: 'OK' } } },
        },
      }),
    )
    expect(ep.id).toBe('get_rarities_rarity')
  })

  test('path item that is a $ref resolves to its operations', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/shared': { $ref: '#/components/pathItems/Shared' },
      },
      components: {
        pathItems: {
          Shared: {
            get: {
              operationId: 'sharedGet',
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      },
    } as unknown as OpenAPIV3.Document

    const ep = parseOpenApiSpec(doc)[0]
    expect(ep.id).toBe('sharedGet')
    expect(ep.path).toBe('/shared')
    expect(ep.method).toBe('get')
  })
})
