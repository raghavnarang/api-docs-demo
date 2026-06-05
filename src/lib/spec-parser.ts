import type { OpenAPIV3 } from 'openapi-types'

/**
 * OpenAPI 3.x → flat, typed endpoint model for the docs view.
 *
 * Local `#/components/...` `$ref`s are resolved against the document. External
 * refs (other files/URLs) are not. `EndpointDef`/`EndpointParam` are read-only
 * spec-derived metadata — the Sandbox derives an editable request FROM them, it
 * does not mutate them.
 */

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'patch'

export interface EndpointParam {
  name: string
  in: 'path' | 'query' | 'header' | 'cookie'
  required: boolean
  type?: string
  description?: string
}

export interface EndpointResponse {
  status: string
  description?: string
}

export interface EndpointDef {
  /** Stable id: spec `operationId` if present, else a method+path slug. */
  id: string
  method: HttpMethod
  path: string
  summary?: string
  description?: string
  params: EndpointParam[]
  requestBody?: { required: boolean; contentTypes: string[] }
  responses: EndpointResponse[]
}

const METHODS: HttpMethod[] = ['get', 'put', 'post', 'delete', 'patch']

/** Resolve a local `#/a/b/c` pointer against the document; undefined otherwise. */
function resolveRef<T>(doc: OpenAPIV3.Document, ref: string): T | undefined {
  if (!ref.startsWith('#/')) return undefined
  let current: unknown = doc
  for (const segment of ref.slice(2).split('/')) {
    if (current && typeof current === 'object' && segment in current) {
      current = (current as Record<string, unknown>)[segment]
    } else {
      return undefined
    }
  }
  return current as T
}

/** Follow a `$ref` to the real object, or return the node if already inline. */
function deref<T extends object>(
  doc: OpenAPIV3.Document,
  node: T | OpenAPIV3.ReferenceObject,
): T | undefined {
  return '$ref' in node ? resolveRef<T>(doc, node.$ref) : node
}

function schemaType(
  doc: OpenAPIV3.Document,
  raw?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
): string | undefined {
  if (!raw) return undefined
  const schema = deref<OpenAPIV3.SchemaObject>(doc, raw)
  if (!schema) return undefined
  if (schema.type === 'array') {
    const item = schema.items ? deref<OpenAPIV3.SchemaObject>(doc, schema.items) : undefined
    return item?.type ? `array<${item.type}>` : 'array'
  }
  return schema.type
}

function parseParam(
  doc: OpenAPIV3.Document,
  raw: OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject,
): EndpointParam | undefined {
  const param = deref<OpenAPIV3.ParameterObject>(doc, raw)
  if (!param) return undefined
  return {
    name: param.name,
    in: param.in as EndpointParam['in'],
    required: param.required ?? param.in === 'path',
    type: schemaType(doc, param.schema),
    description: param.description,
  }
}

/** Flatten an OpenAPI 3.x document into a list of endpoints. */
export function parseOpenApiSpec(doc: OpenAPIV3.Document): EndpointDef[] {
  const endpoints: EndpointDef[] = []

  for (const [path, pathItem] of Object.entries(doc.paths ?? {})) {
    if (!pathItem) continue

    // Params declared at the path level apply to every operation on it.
    const sharedParams = (pathItem.parameters ?? [])
      .map((p) => parseParam(doc, p))
      .filter((p): p is EndpointParam => p !== undefined)

    for (const method of METHODS) {
      const op = pathItem[method]
      if (!op) continue

      const opParams = (op.parameters ?? [])
        .map((p) => parseParam(doc, p))
        .filter((p): p is EndpointParam => p !== undefined)

      const body = op.requestBody
        ? deref<OpenAPIV3.RequestBodyObject>(doc, op.requestBody)
        : undefined

      endpoints.push({
        // Prefer the spec's canonical operationId; fall back to a method+path slug.
        id:
          op.operationId ??
          `${method}_${path}`.replace(/[^a-z0-9]+/gi, '_').toLowerCase(),
        method,
        path,
        summary: op.summary,
        description: op.description,
        params: [...sharedParams, ...opParams],
        requestBody: body
          ? {
              required: body.required ?? false,
              contentTypes: Object.keys(body.content ?? {}),
            }
          : undefined,
        responses: Object.entries(op.responses ?? {}).map(([status, res]) => {
          const resolved = deref<OpenAPIV3.ResponseObject>(doc, res)
          return { status, description: resolved?.description }
        }),
      })
    }
  }

  return endpoints
}
