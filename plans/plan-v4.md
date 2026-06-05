# Plan v4 — Catalogue & Documentation: DAL layer + hooks (APPROVED)

> Snapshot from Entry 012 (prompts.md). Follows the completed setup
> ([plan-v3.md](plan-v3.md)). First feature-phase plan.

## Context

Setup done (Hello World boots through the full provider chain). This phase = the
**data layer for API Catalogue & Documentation** (§2.2), bounded to **DAL +
feature hooks only — no UI** (UI in a follow-up plan).

Two decisions:

1. **API registry becomes a data source.** `API_REGISTRY` stays the file the
   reviewer edits (contract unchanged); the app reads the catalogue *through the
   DAL* via `ApiCatalogRepository`. The `local-json` adapter sources it from
   `API_REGISTRY` + bundled spec/docs. Default switches `mock → local-json`;
   `mock` stays in-memory fixtures.
2. **Search behind the DAL; debounce on the client.** `searchEndpoints(q)` is a
   repo method (local adapter = in-memory filtering; future rest adapter = backend
   call). `useDebouncedValue` feeds the debounced query into TanStack Query.

**Out of scope:** UI/components/routes; choosing OpenAPI products (registry stays
empty); `react-markdown`/`remark-gfm` (only needed when docs are rendered).
**Tests:** deferred to a separate pass (adapter kept testable via injectable registry).

## Repository surface (ApiCatalogRepository)

| Method | Backs (§2.2) |
|---|---|
| `listApis()` | sidebar/catalogue list |
| `getApi(id)` | per-API metadata + SDK links |
| `getSpec(id)` | per-endpoint docs view (lazy) |
| `getDocs(id)` | Getting Started markdown (raw string) |
| `getErrorReference(id)` | error reference catalogue |
| `searchEndpoints(q)` | search over **endpoints, descriptions, parameters** |

`EndpointDef`/`EndpointParam` (in `spec-parser`) are read-only spec-derived
metadata; editable params are a Sandbox (§2.3) concern.

## Files

- `spec-parser.ts` — `parseOpenApiSpec(doc): EndpointDef[]` (paths×methods,
  params/requestBody/responses, local `#/components` `$ref` resolver; `openapi-types`).
- `data/types.ts` — `ApiSummary`, `SdkLink`, `ApiDetail`, `ErrorRefEntry`, `EndpointSearchResult`.
- `data/repositories.ts` — expand `ApiCatalogRepository` (6 methods).
- `data/query-keys.ts` — `detail/spec/docs/errors/search`.
- `data/endpoint-search.ts` — shared in-memory search (endpoints/descriptions/parameters).
- `data/providers/local-json/index.ts` — `createLocalJsonDataSource(registry = API_REGISTRY)`.
- `data/providers/mock/index.ts` — `mock` = local-json over inline fixtures.
- `data/providers/index.ts` — register `local-json`.
- `apis/api-registry.ts` — `ApiDefinition` carries `spec/docs?/sdks?/errorReference?`; `API_REGISTRY = []`.
- `app/config.ts` — `dataSource: 'local-json'`.
- `lib/hooks/use-debounced-value.ts`; `features/docs/hooks/use-catalog.ts`.
- `package.json` — add `openapi-types`.

## Verification
type-check 0 · lint 0 errors · build ok · existing smoke test green. Throwaway
sanity confirmed mock catalog reads + `searchEndpoints` (path/summary/param-desc/empty).
