# Developer Portal

Extensible API documentation & sandbox SPA for external developers. PokéAPI is
used as demo data; the architecture is designed so a reviewer can add a second
API with no component changes.

> **Status:** auth + docs browsing live. Supabase-backed sign in / up / out,
> protected sections, and OpenAPI-driven docs. Remaining portal features land next.

## Prerequisites

- Node.js 20+ (developed on 24)
- npm 10+
- A Supabase project (free tier) for auth — see [Authentication](#authentication).

## Getting started

```bash
cp .env.example .env   # fill in your Supabase URL + publishable key
npm install
npm run dev            # http://localhost:5173
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
`useAuth()` exposes session/sign-in/out. Swappable: `supabase` (**default**),
`mock`, `firebase`, `auth0`, `custom-jwt`. See [Authentication](#authentication).

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

## Authentication

The portal uses **Supabase Auth** (`appConfig.authProvider = 'supabase'`).

**Why Supabase:** generous free tier, email/password out of the box, and a
client SDK that handles the hard parts for us — `persistSession` keeps the
session in `localStorage` (survives reload) and `autoRefreshToken` performs
**silent JWT refresh** in the background. Both fall out of the SDK defaults; the
adapter just forwards the refreshed session to the app via `onAuthStateChange`.
It also slots cleanly behind our provider-agnostic `AuthProvider` contract, so
swapping to Auth0/Firebase later is a one-file adapter, not a rewrite.

### Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the **Project URL** and the
   **publishable** (anon) key.
3. Put them in `.env` (never committed — see `.env.example`):

   ```bash
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
   ```

   Read only inside the Supabase adapter factory
   (`src/lib/auth/providers/supabase/index.ts`) — the app never reads
   `import.meta.env` directly.

### Creating a test user

Two options:

- **Dashboard:** Supabase → **Authentication → Users → Add user**. Enable
  *Auto Confirm* so the account is usable immediately.
- **In-app sign-up:** use the **Sign up** toggle on `/login`. By default Supabase
  requires email confirmation, so the app shows a "check your email" notice and
  no session is created until you confirm. For frictionless review, disable
  **Authentication → Sign In / Providers → Confirm email** — sign-up then logs
  the user in instantly and redirects into the portal.

### What's protected

- Docs (`/docs`) are **public**.
- `/keys` and `/sandbox` sit behind a route guard (`src/routes/authenticated.tsx`):
  unauthenticated visits redirect to `/login?redirect=<path>`, and after sign-in
  you land back on the requested page. The guard reads auth from the router
  context, which re-injects on every session change so it re-runs automatically.

## Adding a new API (planned workflow)

1. Drop an OpenAPI 3.x spec at `src/apis/<api-name>/openapi.json`.
2. Add one entry to `API_REGISTRY` in `src/apis/api-registry.ts`.
3. Optionally add `docs.md`, `changelog.json`, and SDK links.

No component code changes — the portal renders dynamically from the registry.
