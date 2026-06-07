/**
 * Pure seeders: derive the sandbox's initial editable form state from a parsed
 * `EndpointDef`. Path/query/header rows come from the endpoint's params; the body
 * is a JSON skeleton walked from the request-body `SchemaNode`.
 */

import type { EndpointDef, SchemaNode } from '../spec-parser'
import type { KeyValueRow } from './build-request'

function rowsFor(
  endpoint: EndpointDef,
  location: 'path' | 'query' | 'header',
): KeyValueRow[] {
  return endpoint.params
    .filter((p) => p.in === location)
    .map((p) => ({ key: p.name, value: '', enabled: true }))
}

export function initialPathParamRows(endpoint: EndpointDef): KeyValueRow[] {
  return rowsFor(endpoint, 'path')
}

export function initialQueryParamRows(endpoint: EndpointDef): KeyValueRow[] {
  return rowsFor(endpoint, 'query')
}

export function initialHeaderRows(endpoint: EndpointDef): KeyValueRow[] {
  return rowsFor(endpoint, 'header')
}

/** Produce a representative value for a schema node, for the body skeleton. */
function sampleForSchema(node: SchemaNode | undefined): unknown {
  if (!node || node.circular) return null
  if (node.example !== undefined) return node.example
  if (node.default !== undefined) return node.default
  // For unions, seed from the first variant.
  if (node.variants && node.variants.length > 0) {
    return sampleForSchema(node.variants[0])
  }
  if (node.enum && node.enum.length > 0) return node.enum[0]

  switch (node.type) {
    case 'object': {
      const obj: Record<string, unknown> = {}
      for (const prop of node.properties ?? []) {
        // readOnly fields appear only in responses — omit from request bodies.
        if (prop.schema.readOnly) continue
        obj[prop.name] = sampleForSchema(prop.schema)
      }
      return obj
    }
    case 'array':
      return node.items ? [sampleForSchema(node.items)] : []
    case 'string':
      return node.format ?? ''
    case 'integer':
    case 'number':
      return 0
    case 'boolean':
      return false
    default:
      return null
  }
}

/** Pretty-printed JSON skeleton for the body editor; empty when no request body. */
export function initialBody(endpoint: EndpointDef): string {
  const schema = endpoint.requestBody?.schema
  if (!schema) return ''
  return JSON.stringify(sampleForSchema(schema), null, 2)
}

/** Assemble the full initial form state for a freshly selected endpoint. */
export function initialFormState(endpoint: EndpointDef) {
  return {
    pathParams: initialPathParamRows(endpoint),
    queryParams: initialQueryParamRows(endpoint),
    headers: initialHeaderRows(endpoint),
    body: initialBody(endpoint),
  }
}
