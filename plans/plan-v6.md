# Plan: API Catalogue & Documentation UI — core docs pass (§2.2)

## Context

DAL + hooks + `spec-parser` (now with `SchemaNode` for body/response schemas) are done and
tested, but there is **no UI**: the app is a single `/` scaffold route, `src/components/` is
empty, and `API_REGISTRY` is empty so nothing is visible.

This pass builds the **core documentation experience**: a persistent app shell + sidebar, a
catalogue landing, and a scroll-per-API docs page that renders every endpoint **entirely from
the OpenAPI spec** (method badge, path, description, params table, request-body schema table,
response schema tables with status codes), with loading/empty/error states everywhere and the
correct HTTP colour convention. We seed PokéAPI + a financial `stub-payments` so it is
demonstrably working and the §4 extensibility test passes.

**Decisions (confirmed):** scroll-per-API page + anchors + TOC sidebar (docs = skimmable
reference; per-endpoint interaction belongs to the Sandbox) · extend `spec-parser` with display
fields (constraints / readOnly / discriminator) · seed three APIs: **real PokéAPI** + **real
TCGdex** (both vendored as JSON) + hand-authored financial **stub-payments**.

**Deferred to a follow-up pass:** Cmd/Ctrl+K search, Getting Started markdown (react-markdown),
SDK links section, error reference section. The shell + scroll page are built so these slot in
as additional sidebar TOC sections + page sections with no rework.

**Out of scope:** auth/route protection (mock auth; routes open for now), sandbox, keys,
analytics, status, changelog.

## 1. spec-parser display fields — `src/lib/spec-parser.ts` (+ test)

Additive only. Extend `SchemaNode`:
```ts
// validation constraints (all optional, carried straight through)
minimum?, maximum?, exclusiveMinimum?, exclusiveMaximum?, multipleOf?: number
minLength?, maxLength?, minItems?, maxItems?, minProperties?, maxProperties?: number
pattern?: string
uniqueItems?: boolean
default?: unknown
// access + polymorphism
readOnly?: boolean
writeOnly?: boolean
discriminator?: string   // propertyName from OpenAPI `discriminator`
```
In `normalizeSchema`, copy these from the resolved `SchemaObject` onto the node (and set
`discriminator = schema.discriminator?.propertyName`). New tests: constraints carry-through,
`readOnly`/`writeOnly`, `discriminator` on a oneOf union. Keep the existing 15 green.

**Endpoint id uniqueness guard** (real specs are messy — TCGdex has 31/33 ops with
`operationId: null` and a bogus duplicate; a spec could also reuse an operationId across ops).
In `parseOpenApiSpec`, track emitted ids and suffix collisions (`id`, `id_2`, …) so anchor ids
+ search keys stay unique. New test: two ops sharing an operationId get distinct ids.

## 2. HTTP colour convention — `src/components/http/conventions.ts`

Single source of truth (reused by docs now, sandbox later):
- `methodColor(method)` → Tailwind classes. GET = blue, POST = green, PUT/PATCH = amber,
  DELETE = red, default = slate.
- `statusColor(status)` → 2xx green, 3xx blue, 4xx amber, 5xx red, `default`/other = slate.

## 3. Shared primitives — `src/components/`

Per §6.3 (reused, not duplicated; no business logic):
- `MethodBadge.tsx`, `StatusBadge.tsx` — consume `conventions.ts`. Uppercase method / status code.
- `Skeleton.tsx` — pulsing placeholder blocks.
- `EmptyState.tsx`, `ErrorState.tsx` — icon + message (+ optional retry on error).
- `QueryBoundary.tsx` — wraps a TanStack Query result + optional `isEmpty` predicate; renders
  Skeleton / ErrorState(retry) / EmptyState / `children(data)`. Standardizes the three required
  states so every data-dependent view gets them for free.
- `ParamsTable.tsx` — renders `EndpointParam[]` as name / type / required / description, grouped
  by `in` (path / query / header).
- `SchemaViewer.tsx` — recursively renders a `SchemaNode` as an indented field table:
  per-property row = name · type (+ `array<…>`, `format`, enum values) · required · a rules
  cell (min/max/pattern/default/minLength/etc.) · description. Handles: nested objects
  (expand), array `items`, `oneOf`/`anyOf` → "One of:" variant blocks, `additionalProperties`
  (map: `{ [key: string]: <value> }`), `readOnly`/`writeOnly` tags, and the `circular` marker.

## 4. Layout & routing — `src/routes/` + `src/router.tsx`

Routes registered manually in `router.tsx` (current pattern):
- `appLayoutRoute` (pathless `id: 'app'`) → `AppShell` (persistent sidebar + `<Outlet>`).
- `/` → redirect to `/docs` (replace `HomePage` in `src/routes/index.tsx`).
- `docsIndexRoute` `/docs` → `CatalogueGrid` (cards from `useApis`; empty state if registry empty).
- `apiDocsRoute` `/docs/$apiId` → `ApiDocsPage`: header (name/version/baseUrl/description from
  `useApi`) + endpoint sections from `useApiSpec` → `parseOpenApiSpec`, each wrapped in an
  anchor `id={endpoint.id}`.

Hash navigation (not a route per endpoint): sidebar TOC links to `/docs/$apiId#<endpointId>`;
on hash change / after the spec query resolves, `scrollIntoView` the target (handle the
load-then-scroll race). Scroll-spy highlights the active endpoint in the TOC.

### Feature components — `src/features/docs/components/`
- `AppShell.tsx` — two-column layout: `Sidebar` + main `<Outlet>`. Site title/header.
- `Sidebar.tsx` — `useApis` list; the active API expands into a TOC of its endpoints grouped
  by tag (fallback: by method), each an anchor link with a `MethodBadge`; active item from
  scroll-spy. (Getting Started / Errors / SDKs TOC entries land in the follow-up pass.)
- `CatalogueGrid.tsx` — API cards (name, version, description, baseUrl) linking to `/docs/$apiId`.
- `ApiDocsPage.tsx` — composes header + the endpoint scroll list under `QueryBoundary`.
- `EndpointSection.tsx` — one anchored endpoint: `MethodBadge` + path + summary/description,
  `ParamsTable`, request body (contentTypes + `SchemaViewer`), responses (each `StatusBadge` +
  description + `SchemaViewer`).

### Hook — `src/features/docs/hooks/use-scroll-spy.ts`
IntersectionObserver over the endpoint section ids → returns the active id for the sidebar.

## 5. Seed data — `src/apis/` (three APIs)

Real specs are **vendored as JSON** (one-off convert, committed — matches §4 "drop an
`openapi.json` into the folder"; deterministic, offline, CI-safe).

- `pokeapi/openapi.json` — **real** PokéAPI spec (from the provided gist; YAML → JSON via
  `ruby -ryaml -rjson`). 96 GET endpoints, query params (limit/offset), paths carry the
  `/api/v2/...` prefix → registry `baseUrl: 'https://pokeapi.co'` so sandbox URLs resolve live.
  No response schemas in this spec (sections render params only — handled gracefully).
- `tcgdex/openapi.json` — **real** TCGdex spec (apis.guru). 33 GET endpoints, `$ref`-heavy
  response schemas (Card/Set/Serie) → exercises response-schema tables + `$ref` resolution.
  Server URL is templated `https://api.tcgdex.net/v2/{lang}` → registry `baseUrl:
  'https://api.tcgdex.net/v2/en'` (resolve the `lang` default).
- `stub-payments/openapi.json` — hand-authored: GET `/payments` (list), POST `/payments`
  (request **body schema** with a `oneOf` payment-method + `discriminator` + constraints like
  `amount` minimum/multipleOf + a `readOnly` id → exercises body table, composition, rules cell,
  readOnly tag), DELETE `/payments/{id}` (red badge + path param). `baseUrl` a mock placeholder.
- Populate `API_REGISTRY` in `src/apis/api-registry.ts` with all three entries (`spec` imported
  from each JSON). Demonstrates §4 strongly: a 4th API = drop a folder + one entry, no component
  change.
- Ensure `tsconfig` has `resolveJsonModule: true` for the JSON imports (verify; add if missing).

## Verification

1. `npm run dev` → `/` redirects to `/docs`; sidebar lists PokéAPI + TCGdex + stub-payments;
   catalogue grid shows all three cards.
2. Open PokéAPI → header renders; 96 endpoint sections stacked; `GET /api/v2/pokemon/{id}/`
   shows blue method badge, path, query params table (limit/offset). Sidebar TOC click scrolls
   to the section; scroll-spy highlights it.
3. Open TCGdex → `GET /cards/{cardId}` shows a response schema table (`200` status badge,
   `$ref`-resolved Card fields). Confirms response-schema rendering + `$ref` resolution on a
   real spec; null-operationId endpoints still get unique anchors.
4. Open stub-payments → POST shows green badge + request body table incl. a "One of:" block,
   a rules cell (amount min/multipleOf), and a readOnly tag; DELETE shows red badge + path param.
5. States: throttle network → Skeleton; empty registry mentally → EmptyState; force a query
   error → ErrorState with retry (all via `QueryBoundary`).
6. `npm run type-check && npm run lint` → zero errors. `npm test`:
   - `conventions` method/status colour mapping.
   - `spec-parser` display-field extension (constraints, readOnly/writeOnly, discriminator) +
     endpoint id uniqueness guard.
   - `SchemaViewer` renders fields/constraints/variants from a fixture `SchemaNode`.
   - `EndpointSection` renders params + schemas from a fixture spec (data-driven, not hardcoded).
   - `CatalogueGrid` empty state.

## Commits (Conventional, atomic)

- `feat(spec-parser): carry validation constraints, readOnly, discriminator`
- `feat(spec-parser): guarantee unique endpoint ids`
- `test(spec-parser): cover display fields + id uniqueness`
- `feat(components): HTTP colour conventions + method/status badges`
- `feat(components): skeleton, empty, error states + QueryBoundary`
- `feat(components): params table + recursive schema viewer`
- `feat(docs): app shell, sidebar TOC, catalogue grid + routes`
- `feat(docs): scroll-per-API page with endpoint sections from spec`
- `feat(docs): scroll-spy + hash anchor navigation`
- `feat(apis): vendor real PokéAPI + TCGdex specs`
- `feat(apis): add stub-payments spec and register all three APIs`
- `test(docs): conventions, schema viewer, endpoint section, catalogue`
