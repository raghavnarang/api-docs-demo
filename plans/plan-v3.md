# Plan v3 — Adapter selection via typed config (APPROVED)

> Snapshot from Entry 007 (prompts.md). Builds on [plan-v1.md](plan-v1.md) + [plan-v2.md](plan-v2.md). This is the approved plan for implementation.

## Delta from v2

### Adapter selection = typed config, not env vars
`app/config.ts` exports a typed `AppConfig` (`{ dataSource: DataSourceKind; authProvider: AuthProviderKind; sandbox: {...} }`) — **single source of truth** for adapter selection. Each abstraction has a **type-safe adapter registry** `Record<Kind, () => Adapter>`, so adding a new kind is exhaustively type-checked (missing registry entry = compile error).

- App code reads `appConfig`, never `import.meta.env` directly.
- Env vars keep one job: **provider secrets** (Supabase URL/key, Auth0 domain, …) read inside each adapter factory, plus an optional deploy-time override seam.
- Unlocks the runtime multi-environment switcher bonus (config can be made reactive).

`data-source.ts` + `providers/index.ts`: `dataSourceRegistry`; `getDataSource()` resolves `appConfig.dataSource` (mock default). Same shape for auth: `authProviderRegistry`, `auth-source.ts` resolves `appConfig.authProvider`.

`.env.example` documents only secrets/placeholders (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_AUTH0_DOMAIN`, …) — adapter *choice* lives in typed `appConfig`.

## Full approved scope (carried from v1 + v2)
- Stack: Vite + React 18 + TS strict · TanStack Router v1 · TanStack Query v5 · Zustand · Tailwind v4 · Zod · Vitest + RTL · ESLint + Prettier.
- Folder skeleton per v1 (`apis/`, `features/`, `components/`, `lib/{data,auth,sandbox,spec-parser,snippet-generator}`, `routes/`, `app/`).
- DAL + Auth abstraction interfaces + mock default impls so hello-world runs through the chain.
- Sandbox: REST-only client + `useSandboxRequest()` on `useMutation` for all verbs (v2).
- Hello World: `providers.tsx` composes QueryClientProvider → AuthProvider(mock) → RouterProvider; index route renders Tailwind "Hello — Developer Portal".
- Tooling: scripts (dev/build/preview/lint/type-check/test/format), strict tsconfig, flat eslint, prettier, .gitignore, .env.example, smoke test, README.

## Build order
1. `npm create vite@latest . -- --template react-ts` (keeps existing files).
2. Install deps.
3. Configure Vite (tailwind + router + vitest), tsconfig strict, eslint flat, prettier.
4. Folder skeleton + abstraction interfaces + mock impls + typed config.
5. Wire providers + routes → Hello World.
6. Smoke test + README + .env.example.
7. `git init` + conventional commits.

## Verification
- `npm install && npm run dev` → Hello World < 2 min, no console errors.
- `npm run type-check` / `lint` / `build` / `test` all pass.
- Flip `appConfig.dataSource` / `appConfig.authProvider`: app boots on `mock`; other kinds resolve to stubs (documented).
