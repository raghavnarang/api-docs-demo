# Plan: spec-parser — request/response schema extraction

## Context

`src/lib/spec-parser.ts` flattens an OpenAPI 3.x doc into `EndpointDef[]` for the docs view.
It currently captures params (with a flat `type`), but for request/response bodies it keeps
**only** MIME names and status text — it throws the actual schema away:

```ts
requestBody?: { required: boolean; contentTypes: string[] }      // no schema
responses:    { status: string; description?: string }[]         // no schema
```

The docs view (§2.2) must render the **request body schema** and **response schemas** as
field tables (field name / type / required / description, incl. nested objects + arrays).
This task adds that — a resolved, recursive `SchemaNode` tree on `requestBody` and each
`response`. Additive only: existing fields and current parse behavior are unchanged. UI work
is deferred to a later task.

## Design — `src/lib/spec-parser.ts`

### New domain type

```ts
export interface SchemaNode {
  type?: string                       // 'string' | 'object' | 'array' | 'integer' | ...
  format?: string                     // 'int64', 'date-time', ...
  description?: string
  required?: boolean                  // set by PARENT for object properties (flat, like EndpointParam)
  enum?: (string | number | boolean)[]
  properties?: { name: string; schema: SchemaNode }[]   // ordered; object props
  items?: SchemaNode                  // array element schema
  nullable?: boolean
  example?: unknown
  circular?: boolean                  // true when a $ref cycle was cut here
}
```

Design choice: `required` is **flattened onto each property node** (parent reads the object's
`required: string[]` and stamps the child), mirroring the existing flat `EndpointParam.required`
so the renderer stays dumb. `properties` is an **ordered array**, not a map, to preserve spec
order in the table.

### New function

```ts
function normalizeSchema(
  doc: OpenAPIV3.Document,
  raw: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined,
  seen?: Set<string>,            // $ref strings on the current path — cycle guard
): SchemaNode | undefined
```

Behavior:
- `undefined` raw → `undefined`.
- Resolve `$ref` via existing `deref`/`resolveRef`. Unresolvable (external file / unknown
  local pointer) → `undefined` (graceful, no throw).
- **Cycle guard**: track `$ref` strings in `seen` on the current descent path. If a ref is
  already in `seen`, return `{ type, circular: true }` and stop. Add on enter, delete on
  unwind so the same schema reused in sibling branches still renders.
- `type: 'object'` → map `properties` to ordered `{ name, schema }[]`; for each, recurse and
  stamp `schema.required = obj.required?.includes(name) ?? false`.
- `type: 'array'` → recurse `items` into `.items`.
- Carry through `format`, `description`, `enum`, `nullable`, `example`.
- **Composition (added after review — common in real financial specs):**
  - `allOf` → merge member properties + own properties into one object (de-dupe by name,
    OR the `required` flag).
  - `oneOf`/`anyOf` → surface members as `variants: SchemaNode[]` + `composition` tag
    (renderer shows "One of: …") instead of flattening.
  - `additionalProperties` → `additionalProperties?: SchemaNode` map marker (`{}` = any).
  - OpenAPI **3.1** `type: ["string","null"]` array → collapse to single `type` + `nullable`.
  - Path item that is itself a `$ref` → resolved before reading operations.

### Wire into `parseOpenApiSpec`

Add a small `pickContentSchema(content)` helper: prefer `application/json`, else the first
content type; return its `.schema`.

- `requestBody` (keep current fields, add `schema`):
  ```ts
  requestBody: body
    ? {
        required: body.required ?? false,
        contentTypes: Object.keys(body.content ?? {}),
        schema: normalizeSchema(doc, pickContentSchema(body.content)),
      }
    : undefined
  ```
- Each response (keep current fields, add `schema`):
  ```ts
  { status, description: resolved?.description,
    schema: normalizeSchema(doc, pickContentSchema(resolved?.content)) }
  ```

### Type changes (`EndpointDef`)

```ts
requestBody?: { required: boolean; contentTypes: string[]; schema?: SchemaNode }
responses: { status: string; description?: string; schema?: SchemaNode }[]
```

## Test cases — `src/lib/spec-parser.test.ts` (Vitest)

Tests build small inline `OpenAPIV3.Document` fixtures and assert on `parseOpenApiSpec` output.
**Please review this list — these are exactly what I'll write:**

1. **Regression / back-compat** — an endpoint with params and no body still parses: correct
   `id`, `method`, `path`, params (name/in/required/type), and a response with only a
   `description` yields `schema === undefined`. (Proves existing behavior intact.)

2. **Inline request body object** — POST with
   `{ amount: integer (required), currency: string enum ["USD","EUR"] (required), note: string }`.
   Assert: `requestBody.contentTypes === ['application/json']`, `requestBody.required === true`,
   `schema.type === 'object'`, `properties` length 3 **in order**, `amount.required === true`,
   `note.required === false`, `currency.enum` equals `['USD','EUR']`.

3. **Response schema via `$ref`** — 200 response references `#/components/schemas/Pokemon`
   (object with `id`, `name`). Assert: `responses[0].status === '200'`, description preserved,
   `schema.properties` names include `id` and `name`.

4. **Array schema** — a property `types` of `type: array, items: $ref NamedAPIResource`.
   Assert: node `type === 'array'`, `items` defined, `items.properties` includes the ref's
   fields.

5. **Nested object** — object property whose value is itself an object → recursion yields a
   nested `properties` array at the right depth.

6. **`$ref` cycle guard** — schema `Node` with property `child: $ref Node` (self-referential).
   Assert: parse terminates (no infinite loop / stack overflow) and the repeated ref node has
   `circular === true`.

7. **`required[]` mapping** — only props listed in the object's `required` array get
   `required === true`; unlisted props get `false`.

8. **Metadata carry-through** — `format`, `nullable`, `description`, `example` on a schema are
   present on the resulting node.

9. **Content-type selection** — body with both `application/json` and `application/xml`:
   `contentTypes` has both, but `schema` is taken from the JSON one. A body with only
   `application/xml`: `schema` is normalized from that single type (prefer-json-else-first).

10. **Graceful unresolvable `$ref`** — response/body schema is `$ref` to an unknown local
    pointer or external file → `schema === undefined`, **no throw**, rest of the endpoint
    still parses.

## Verification

- `npm test` → new `spec-parser.test.ts` passes (10 cases above).
- `npm run type-check` → zero errors (new optional fields are additive).
- `npm run lint` → clean.

## Commits (Conventional, atomic)

- `feat(spec-parser): resolve request/response body schemas into SchemaNode`
- `test(spec-parser): cover schema normalization, $ref, arrays, cycles`
