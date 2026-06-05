# Plan v1 — Project Setup (initial)

> Snapshot from Entry 005 (prompts.md). Superseded by [plan-v2.md](plan-v2.md) / [plan-v3.md](plan-v3.md).

## Context
Extensible API documentation + sandbox SPA for external developers (PokéAPI demo data). **This phase: project setup only**, no features. `npm ci && npm run dev` boots a Hello World page in < 2 min, with DAL + Auth abstraction skeletons in place.

Requirements:
1. **DAL via TanStack Query** — app consumes data through repository interfaces; data source (REST / GraphQL / localStorage / local JSON) swappable behind the abstraction.
2. **Auth abstraction** — any provider (Supabase / Firebase / Auth0 / custom JWT) swappable behind one `AuthProvider` interface.
3. **Sandbox executor always REST** — separate from the DAL swap.

Decisions: TanStack Router v1 · Zustand · Tailwind CSS v4 · scaffold interfaces + one mock default impl.

## Stack
Vite + React 18 + TS (`strict`) · TanStack Router v1 · TanStack Query v5 · Zustand · Tailwind v4 · Zod · Vitest + RTL · ESLint + Prettier.

## Folder structure (PDF-aligned + abstraction layers)
```
src/
├── apis/api-registry.ts          # source of truth (empty stub)
├── features/                     # auth/ docs/ sandbox/ keys/ analytics/ changelog/ status/ (empty)
├── components/                   # shared primitives (empty)
├── lib/
│   ├── data/                     # DAL: types, repositories, query-keys, data-source, providers/{mock,rest,graphql,local-json}
│   ├── auth/                     # types, auth-context, auth-source, providers/{mock,supabase,firebase,auth0,custom-jwt}
│   ├── sandbox/rest-client.ts    # ALWAYS-REST executor (stub)
│   ├── spec-parser.ts            # stub
│   └── snippet-generator.ts      # stub
├── routes/{__root,index}.tsx
├── app/{providers,config}.ts(x)
├── main.tsx
└── index.css                     # Tailwind v4 entry
```

## Abstraction design
- **DAL**: repository interfaces per domain; `DataSource` bundles them; `getDataSource()` picks impl by `config.dataSource` (mock default). Feature hooks wrap repo calls in `useQuery`/`useMutation`. Components import hooks only.
- **Auth**: `AuthProvider` interface (signIn/signUp/signOut/getSession/getToken/onAuthStateChange); selected by `config.authProvider` (mock default); `useAuth()` via context.
- **Sandbox**: REST-only fetch wrapper, independent of DAL selector. (Hook strategy unspecified in v1.)
- Adapter selection driven by env vars (`VITE_DATA_SOURCE`, `VITE_AUTH_PROVIDER`) in v1.

## Hello World wiring
`providers.tsx`: QueryClientProvider → AuthProvider(mock) → RouterProvider. Root renders `<Outlet/>`; index renders Tailwind "Hello — Developer Portal".

## Verification
`npm install && npm run dev` boots < 2 min, no console errors. `type-check`/`lint`/`build`/`test` all pass.
