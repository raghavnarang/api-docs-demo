# Architecture

## Why This Architecture

This project is a developer portal SPA built to be **extensible without rewrites**. The two headline abstractions — DAL and Auth — exist because real-world portals outlive their first infrastructure choices. You start with local JSON files, then move to a REST API, then maybe a GraphQL service. You start with Supabase, then a client wants Auth0. Without an abstraction boundary, every such switch requires touching feature code.

**Benefits in practice:**

| Problem | Solution | Benefit |
|---|---|---|
| Backend not ready yet | `local-json` adapter reads bundled spec files | Dev/UI work proceeds independently |
| Switching data source (REST, GraphQL, etc.) | Change one line in `appConfig.dataSource` | Zero feature-code changes |
| Switching auth provider (Supabase → Firebase) | Change one line in `appConfig.authProvider` | Zero UI changes |
| New kind added to union | Type-safe registry forces a registry entry | Compile error catches missing adapter, not a runtime crash |
| User identity in data queries | Token flows to adapter; app never passes `userId` | REST adapter forwards token to server; local-json decodes it locally — same app code |
| Sandbox always hits real APIs | `rest-client` bypasses DAL entirely | Docs can be mocked; sandbox requests are always live |
| Spec parsed once per session | TanStack Query caches parsed result under a shared key | Multiple hooks (docs page, sandbox, search) share one parse, no redundant work |

The layered shape — DAL contract → adapter → query hook → UI — also means each layer is independently testable and replaceable.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Build | Vite 6 + React 18 + TypeScript strict | Fast dev, tree-shaking, type-safety |
| Routing | TanStack Router v1 | Type-safe routes + search params, `beforeLoad` auth guard |
| Server state | TanStack Query v5 | Caching, dedup, stale-time control — acts as the DAL client |
| Client state | Zustand | Lightweight; used only for scroll-spy active endpoint id |
| Styling | Tailwind CSS v4 | Utility-first, `@plugin` for typography |
| Validation | Zod | Runtime schemas for form inputs and search params |
| Tests | Vitest + RTL | Co-located unit + component tests |

---

## Core Abstractions

### 1. Data Access Layer (DAL)

> Goal: app code never knows where data comes from. Swap the backend by changing one config value.

**The chain:**

```
appConfig.dataSource  →  dataSourceRegistry  →  DataSource  →  Repository contracts
        ↑                       ↑                                        ↑
  "local-json"         Record<Kind, Factory>           what the app calls
```

**Contracts** (`src/lib/data/repositories.ts`) — four per-domain interfaces:

| Repository | Scope | Auth |
|---|---|---|
| `ApiCatalogRepository` | Specs, docs, errors, changelog, search | None (public) |
| `ApiKeyRepository` | CRUD API keys | Token-scoped (owner resolved inside adapter) |
| `UsageAnalyticsRepository` | Per-key metrics | Token-scoped |
| `ApiStatusRepository` | Health, uptime, incidents, site banner | None (global infra) |

**Adapters** (`src/lib/data/providers/`):

| Adapter | Status | Notes |
|---|---|---|
| `local-json` | Active (default) | Reads `API_REGISTRY`; keys/analytics in `localStorage` |
| `mock` | Active | Re-exports `local-json` — used in tests |
| `rest` | Stub | Ready to wire; `notImplemented` throws on invoke |
| `graphql` | Stub | Same |

**Registry** (`src/lib/data/providers/index.ts`):

```ts
const dataSourceRegistry: Record<DataSourceKind, () => DataSource> = {
  'local-json': () => createLocalJsonDataSource(),
  mock: createMockDataSource,
  rest: notImplemented('rest'),
  graphql: notImplemented('graphql'),
}
```

`Record<DataSourceKind, …>` is exhaustive — adding a new kind to the union forces a registry entry (compile error otherwise).

**Identity boundary** — `ApiKeyRepository` and `UsageAnalyticsRepository` receive only the auth `token`, never a `userId`. The adapter resolves the owner internally (`owner.ts` decodes the JWT `sub`). The app is unaware of how identity maps to data.

---

### 2. Auth Abstraction

> Same pattern as DAL. Swap auth provider by changing one config value.

**Contract** (`src/lib/auth/types.ts`):

```ts
interface AuthProvider {
  signIn / signUp / signOut / getSession / getToken / onAuthStateChange
}
```

**Registry** (`src/lib/auth/providers/index.ts`):

```ts
const authProviderRegistry: Record<AuthProviderKind, () => AuthProvider> = {
  mock: createMockAuthProvider,
  supabase: createSupabaseAuthProvider,
  firebase: notImplemented('firebase'),
  auth0: notImplemented('auth0'),
  'custom-jwt': notImplemented('custom-jwt'),
}
```

**Context** (`auth-context.tsx`) — calls `getAuthProvider()` once, subscribes to `onAuthStateChange`. On sign-out: clears TanStack Query cache (prevents user A's cached data leaking to user B).

**Route guard** — TanStack Router `beforeLoad` on a pathless `authenticatedRoute`. Reads `context.auth.session`; redirects to `/login?redirect=<path>`. Session restore finishes before the router renders (`InnerApp` holds off until `loading === false`).

---

### 3. Config — Single Source of Truth

**`src/app/config.ts`** owns all adapter selection:

```ts
export const appConfig: AppConfig = {
  dataSource: 'local-json',   // swap → 'rest' | 'graphql' | 'mock'
  authProvider: 'supabase',   // swap → 'firebase' | 'auth0' | 'custom-jwt' | 'mock'
  sandbox: { defaultBaseUrl: '...' },
  docs: { specCacheTtlMs: Infinity },
}
```

App code reads `appConfig` — never `import.meta.env` directly. Env vars are reserved for provider secrets (Supabase URL/key, Auth0 domain, etc.), read inside each adapter factory.

---

## TanStack Query as DAL Client

Query hooks live in `features/*/hooks/`. Each hook:
1. Calls the repository method via `getDataSource().catalog.getSpec(id)` etc.
2. Uses a key from the centralized `queryKeys` factory.
3. Lets Query handle caching, dedup, and background refetch.

**Key behaviors:**
- `specCacheTtlMs: Infinity` — spec parsed once per session for static `local-json`; set finite for REST so backend changes are picked up.
- `staleTime` vs `gcTime` — staleTime controls refetch while mounted; gcTime controls eviction after unmount. Both set to `specCacheTtlMs` for specs.
- Multiple hooks with the same key (e.g. `useApiEndpoints` on both the docs page and the sandbox) share one in-flight request and one cache entry — no duplicate fetches.

---

## Sandbox — Always REST

The sandbox executes developer test requests against live endpoints. It bypasses `appConfig.dataSource` entirely and always uses `fetch` directly.

**Why:** The DAL can be backed by local JSON or any other source; sandbox requests must always hit real REST endpoints — those are two different concerns.

**Hook strategy:** `useMutation` for all HTTP verbs (GET included). The sandbox is imperative — triggered on demand, not declaratively synced with server state. HTTP method is just a field on `SandboxRequest`, not the hook selector.

---

## API Registry

`src/apis/api-registry.ts` is the single drop-in point for adding a new API:

1. Drop `openapi.json` in `src/apis/<name>/`.
2. Optionally colocate `docs.md`, `errors.json`, `changelog.json`, SDK links.
3. Add one entry to `API_REGISTRY`.

No component code changes needed. The `local-json` DAL adapter reads the registry and serves it through the repository contracts.

---

## Spec Parser

`src/lib/spec-parser.ts` flattens an OpenAPI 3.x document into `EndpointDef[]`.

Key decisions:
- **`operationId` preferred** for endpoint id; falls back to `method+path` slug with leading/trailing `_` stripped.
- **`$ref` resolved** — local `#/components/…` refs for params, requestBody, responses, path-item `$ref`.
- **`SchemaNode`** — recursive, handles `allOf` merge, `oneOf`/`anyOf` variants, `additionalProperties` maps, circular reference guard.
- **Client-side parse** — raw OpenAPI spec comes from the DAL; the parse happens in the browser and is cached by TanStack Query (keyed by `queryKeys.apis.endpoints(id)`). A REST backend returns the raw spec, not pre-parsed endpoints — this keeps anchor ids frontend-authoritative.

---

## Two-Tier Search

Endpoint anchor ids (e.g. `#get_pokemon_name`) are generated client-side by the spec parser — a REST backend has no way to return them. So a pure backend search returning endpoint ids would break the moment the parser logic changes. A pure frontend search over all APIs would require fetching and parsing every spec upfront, even for APIs the user never visits.

Two tiers splits the work cleanly: the backend (or local-json scan) answers "which API contains this keyword?" — a coarse, id-agnostic result. The frontend then does the precise, anchor-level match only within those matched APIs, reusing specs already in cache.

| Tier | Where | What |
|---|---|---|
| Tier 2 | DAL (`searchApis`) | Which APIs match the query across endpoints/descriptions/params. Returns `{apiId, apiName}` only — no ids (frontend-authoritative). Local-json scans bundled specs; REST hits a backend search endpoint. |
| Tier 1 | Frontend (`endpointMatchesQuery`) | Within a matched API, filters cached parsed endpoints to specific anchors. Reuses the same `useApiEndpoints` parse cache — no third parse. |

**Flow:** user types → debounce (500ms) → Tier-2 gets matching APIs → `useQueries` loads their parsed endpoints (from cache if available) → Tier-1 filters to endpoints → results grouped by API, each deep-linking to `/docs/$apiId#<endpointId>`.

---

## Code Splitting

Two lazy chunks keep the main bundle lean:

| Chunk | Library | Trigger |
|---|---|---|
| `BodyEditor` | CodeMirror 6 (`@uiw/react-codemirror`) | User opens the sandbox body editor |
| `UsageChart` | Recharts | User navigates to `/analytics` |

Both use `React.lazy` + `Suspense`.

---

## Feature Patterns

Each feature follows the same layered shape:

```
DAL contract (repositories.ts)
  └── Adapter implementation (providers/local-json/…)
        └── Query keys (query-keys.ts)
              └── Feature hooks (features/*/hooks/)
                    └── UI components (features/*/components/)
```

| Feature | DAL Scope | Auth |
|---|---|---|
| API Catalogue & Docs | `ApiCatalogRepository` | Public |
| Interactive Sandbox | Direct REST (bypasses DAL) | Optional Bearer inject |
| API Key Management | `ApiKeyRepository` | Token (keys scoped to owner) |
| Usage Analytics | `UsageAnalyticsRepository` | Token (metrics scoped to owner) |
| API Status | `ApiStatusRepository` | Public |
| Changelog | `ApiCatalogRepository.getChangelog` | Public |
