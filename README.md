# Developer Portal

Extensible API documentation & sandbox SPA for external developers. PokéAPI is
used as demo data; the architecture is designed so a reviewer can add a second
API with no component changes.

> **Status:** project scaffold. Boots a Hello World page through the full
> provider chain (TanStack Query + Auth + Router + Tailwind). Features land next.

## Prerequisites

- Node.js 20+ (developed on 24)
- npm 10+

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Script               | What it does                          |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Start Vite dev server                 |
| `npm run build`      | Type-check + production build         |
| `npm run preview`    | Preview the production build          |
| `npm run lint`       | ESLint                                |
| `npm run type-check` | `tsc --noEmit` (strict)               |
| `npm test`           | Vitest (run once)                     |
| `npm run format`     | Prettier                              |

## Architecture

```
src/
├── apis/api-registry.ts   # single source of truth for registered APIs
├── features/              # auth, docs, sandbox, keys, analytics, changelog, status
├── components/            # shared UI primitives
├── lib/
│   ├── data/              # DAL abstraction (TanStack Query backing)
│   ├── auth/              # auth-provider abstraction
│   ├── sandbox/           # always-REST sandbox executor
│   ├── spec-parser.ts     # OpenAPI → domain model (stub)
│   └── snippet-generator.ts # cURL / fetch / python (stub)
├── routes/                # TanStack Router routes
├── app/                   # config (adapter selection) + provider composition
├── router.tsx
└── main.tsx
```

### Data access layer (DAL)

The app never talks to a data source directly. It consumes **repository
interfaces** (`src/lib/data/repositories.ts`); a `DataSource` bundles them
(`src/lib/data/data-source.ts`). Feature hooks wrap repository calls in
TanStack Query (`useQuery` for reads, `useMutation` for writes).

Swappable backends: `mock` (default), `rest`, `graphql`, `local-json`. Each is a
factory in `src/lib/data/providers/`, registered in a **type-safe registry**
(`Record<DataSourceKind, () => DataSource>`).

### Auth

Same pattern. `AuthProvider` (`src/lib/auth/types.ts`) abstracts the provider;
`useAuth()` exposes session/sign-in/out. Swappable: `mock` (default),
`supabase`, `firebase`, `auth0`, `custom-jwt`.

### Sandbox

`src/lib/sandbox/rest-client.ts` is **always REST**, independent of the DAL
selection. Exposed (later) via a `useSandboxRequest()` hook built on
`useMutation` for every HTTP verb (imperative one-shot, no caching).

### Selecting adapters

Adapter choice is a **typed config**, not env vars — edit
`src/app/config.ts` (`appConfig.dataSource`, `appConfig.authProvider`). The
registries are exhaustively type-checked, so an unknown kind is a compile error.
Env vars (`.env`, see `.env.example`) hold only **provider secrets**, read
inside each adapter factory.

## Adding a new API (planned workflow)

1. Drop an OpenAPI 3.x spec at `src/apis/<api-name>/openapi.json`.
2. Add one entry to `API_REGISTRY` in `src/apis/api-registry.ts`.
3. Optionally add `docs.md`, `changelog.json`, and SDK links.

No component code changes — the portal renders dynamically from the registry.
