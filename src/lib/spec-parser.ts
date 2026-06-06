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
  /** Resolved body schema for the response (prefers `application/json`). */
  schema?: SchemaNode
}

/**
 * A resolved, recursive view of an OpenAPI schema for rendering body/response
 * field tables. `$ref`s are followed; `required` is flattened onto each property
 * node (parent stamps it from the object's `required[]`) to mirror the flat
 * `EndpointParam.required` so renderers stay dumb. `properties` is ordered to
 * preserve spec order.
 */
export interface SchemaNode {
  type?: string
  format?: string
  description?: string
  /** Set by the parent object for its properties. */
  required?: boolean
  enum?: (string | number | boolean)[]
  properties?: { name: string; schema: SchemaNode }[]
  /** Element schema when `type === 'array'`. */
  items?: SchemaNode
  /** Value schema for free-form maps (`additionalProperties`); `{}` means "any". */
  additionalProperties?: SchemaNode
  /** Set when the schema is a `oneOf`/`anyOf` union — render `variants`. */
  composition?: 'oneOf' | 'anyOf'
  /** Member schemas of a `oneOf`/`anyOf` union. */
  variants?: SchemaNode[]
  /** `propertyName` of an OpenAPI `discriminator`, if present. */
  discriminator?: string
  nullable?: boolean
  example?: unknown
  /** Default value if the field is omitted. */
  default?: unknown
  /** Field is present only in responses (`readOnly`) or only in requests (`writeOnly`). */
  readOnly?: boolean
  writeOnly?: boolean
  /**
   * Validation constraints carried straight from the spec for the docs "rules"
   * cell. All optional; absent when the schema doesn't set them.
   */
  minimum?: number
  maximum?: number
  exclusiveMinimum?: boolean | number
  exclusiveMaximum?: boolean | number
  multipleOf?: number
  minLength?: number
  maxLength?: number
  minItems?: number
  maxItems?: number
  minProperties?: number
  maxProperties?: number
  uniqueItems?: boolean
  pattern?: string
  /** True when a `$ref` cycle was cut here. */
  circular?: boolean
}

export interface EndpointDef {
  /** Stable id: spec `operationId` if present, else a method+path slug. */
  id: string
  method: HttpMethod
  path: string
  summary?: string
  description?: string
  params: EndpointParam[]
  requestBody?: {
    required: boolean
    contentTypes: string[]
    schema?: SchemaNode
  }
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
    const item = schema.items
      ? deref<OpenAPIV3.SchemaObject>(doc, schema.items)
      : undefined
    return item?.type ? `array<${item.type}>` : 'array'
  }
  return schema.type
}

/**
 * Copy display-only metadata (validation constraints, access flags, discriminator)
 * from a resolved schema onto its node. Only sets keys the spec actually defines so
 * the node stays sparse. Mutates `node`.
 */
function copyMeta(node: SchemaNode, schema: OpenAPIV3.SchemaObject): void {
  const numeric = [
    'minimum',
    'maximum',
    'exclusiveMinimum',
    'exclusiveMaximum',
    'multipleOf',
    'minLength',
    'maxLength',
    'minItems',
    'maxItems',
    'minProperties',
    'maxProperties',
  ] as const
  for (const key of numeric) {
    if (schema[key] !== undefined) node[key] = schema[key] as never
  }
  if (schema.pattern !== undefined) node.pattern = schema.pattern
  if (schema.uniqueItems !== undefined) node.uniqueItems = schema.uniqueItems
  if (schema.default !== undefined) node.default = schema.default
  if (schema.readOnly !== undefined) node.readOnly = schema.readOnly
  if (schema.writeOnly !== undefined) node.writeOnly = schema.writeOnly
  if (schema.discriminator)
    node.discriminator = schema.discriminator.propertyName
}

/**
 * Resolve an OpenAPI schema into a recursive `SchemaNode`. Follows local `$ref`s,
 * recurses objects/arrays/maps, merges `allOf`, surfaces `oneOf`/`anyOf` as
 * `variants`, and stamps `required` onto each object property.
 *
 * `seen` holds the `$ref` strings on the current descent path: if a ref recurs we
 * cut the cycle (`circular: true`) instead of looping forever, then unwind so the
 * same schema reused in a sibling branch still renders.
 */
function normalizeSchema(
  doc: OpenAPIV3.Document,
  raw?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  seen: Set<string> = new Set(),
): SchemaNode | undefined {
  if (!raw) return undefined

  if ('$ref' in raw) {
    const ref = raw.$ref
    const resolved = resolveRef<OpenAPIV3.SchemaObject>(doc, ref)
    if (!resolved) return undefined
    if (seen.has(ref)) return { type: resolved.type, circular: true }
    seen.add(ref)
    const node = normalizeSchema(doc, resolved, seen)
    seen.delete(ref)
    return node
  }

  const schema = raw

  // OpenAPI 3.1 allows `type: ["string", "null"]`; collapse to a single type + nullable.
  let type = schema.type as string | string[] | undefined
  let nullable = schema.nullable
  if (Array.isArray(type)) {
    if (type.includes('null')) nullable = true
    type = type.find((t) => t !== 'null')
  }

  // oneOf/anyOf are unions — surface the members as variants rather than flattening.
  const union = schema.oneOf ? 'oneOf' : schema.anyOf ? 'anyOf' : undefined
  const members = schema.oneOf ?? schema.anyOf
  if (union && members) {
    const node: SchemaNode = {
      composition: union,
      variants: members
        .map((m) => normalizeSchema(doc, m, seen))
        .filter((n): n is SchemaNode => n !== undefined),
      description: schema.description,
    }
    if (nullable) node.nullable = true
    copyMeta(node, schema)
    return node
  }

  const node: SchemaNode = {
    type,
    format: schema.format,
    description: schema.description,
    nullable,
    example: schema.example,
  }
  if (schema.enum) node.enum = schema.enum as SchemaNode['enum']
  copyMeta(node, schema)

  if (type === 'array' && 'items' in schema && schema.items) {
    node.items = normalizeSchema(doc, schema.items, seen)
  }

  // Merge `allOf` members and the schema's own `properties` into one object,
  // de-duping by name and OR-ing the required flag.
  const props = new Map<string, { name: string; schema: SchemaNode }>()
  const upsert = (name: string, child: SchemaNode) => {
    const existing = props.get(name)
    if (existing) existing.schema.required ||= child.required
    else props.set(name, { name, schema: child })
  }

  if (schema.allOf) {
    if (!node.type) node.type = 'object'
    for (const member of schema.allOf) {
      const memberNode = normalizeSchema(doc, member, seen)
      memberNode?.properties?.forEach((p) => upsert(p.name, p.schema))
    }
  }

  if (schema.properties) {
    const requiredNames = new Set(schema.required ?? [])
    for (const [name, propRaw] of Object.entries(schema.properties)) {
      const propSchema = normalizeSchema(doc, propRaw, seen) ?? {}
      propSchema.required = requiredNames.has(name)
      upsert(name, propSchema)
    }
  }

  if (props.size) node.properties = [...props.values()]

  // Free-form map: `additionalProperties: true` → any value; a schema → typed value.
  if (schema.additionalProperties) {
    node.additionalProperties =
      schema.additionalProperties === true
        ? {}
        : normalizeSchema(doc, schema.additionalProperties, seen)
  }

  return node
}

/** Pick the schema to render from a content map: prefer JSON, else the first type. */
function pickContentSchema(
  content?: Record<string, OpenAPIV3.MediaTypeObject>,
): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined {
  if (!content) return undefined
  const json = content['application/json']
  if (json) return json.schema
  return Object.values(content)[0]?.schema
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

  // Real specs reuse or omit operationIds (e.g. TCGdex: 31/33 ops have none). Track
  // emitted ids and suffix collisions so anchor ids + search keys stay unique.
  const usedIds = new Set<string>()
  const uniqueId = (base: string): string => {
    let id = base
    let n = 2
    while (usedIds.has(id)) id = `${base}_${n++}`
    usedIds.add(id)
    return id
  }

  for (const [path, rawPathItem] of Object.entries(doc.paths ?? {})) {
    if (!rawPathItem) continue

    // A path item may itself be a `$ref` (e.g. shared operations) — resolve it.
    const pathItem = rawPathItem.$ref
      ? resolveRef<OpenAPIV3.PathItemObject>(doc, rawPathItem.$ref)
      : rawPathItem
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
        // `uniqueId` suffixes any collision so ids stay stable and unique.
        id: uniqueId(
          op.operationId ??
            `${method}_${path}`
              .replace(/[^a-z0-9]+/gi, '_')
              .replace(/^_+|_+$/g, '')
              .toLowerCase(),
        ),
        method,
        path,
        summary: op.summary,
        description: op.description,
        params: [...sharedParams, ...opParams],
        requestBody: body
          ? {
              required: body.required ?? false,
              contentTypes: Object.keys(body.content ?? {}),
              schema: normalizeSchema(doc, pickContentSchema(body.content)),
            }
          : undefined,
        responses: Object.entries(op.responses ?? {}).map(([status, res]) => {
          const resolved = deref<OpenAPIV3.ResponseObject>(doc, res)
          return {
            status,
            description: resolved?.description,
            schema: normalizeSchema(doc, pickContentSchema(resolved?.content)),
          }
        }),
      })
    }
  }

  return endpoints
}
