# Developer Portal

Extensible API documentation & sandbox platform for external developers. Built with React 18, TypeScript, and Vite. PokéAPI is included as demo data; the architecture is designed so adding a second API requires touching exactly one file.

## Prerequisites

- Node.js 20+
- npm 10+
- A free [Supabase](https://supabase.com) project (for authentication)

## Quick start

```bash
git clone <repo-url>
cd api-docs-demo
cp .env.example .env       # add your Supabase credentials (see below)
npm install
npm run dev                # http://localhost:5173
```

The app should be running in under 2 minutes from a clean clone.

## Environment variables

Copy `.env.example` to `.env` and fill in the two required values:

```bash
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

Get both from **Supabase → Project Settings → API**. All other keys in `.env.example` are for optional alternate providers and can be left blank.

## Scripts

| Script               | What it does                      |
| -------------------- | --------------------------------- |
| `npm run dev`        | Start Vite dev server             |
| `npm run build`      | Type-check + production build     |
| `npm run preview`    | Serve the production build        |
| `npm run lint`       | ESLint                            |
| `npm run type-check` | `tsc --noEmit` (strict)           |
| `npm test`           | Vitest unit tests (single run)    |
| `npm run format`     | Prettier                          |

## Creating a test user

Two options:

**Option A — Supabase dashboard (fastest for reviewers)**

1. Open your project → **Authentication → Users → Add user**.
2. Enable **Auto Confirm** so the account works immediately without email verification.

**Option B — In-app sign-up**

1. Navigate to `/login` and click **Sign up**.
2. By default Supabase sends a confirmation email. To skip this: go to **Authentication → Providers → Email** and disable *Confirm email*. Sign-up then logs the user in instantly.

## Portal sections

| Section              | Route         | Notes                                          |
| -------------------- | ------------- | ---------------------------------------------- |
| API Catalogue & Docs | `/docs`       | Public — no login required                     |
| Interactive Sandbox  | `/sandbox`    | Protected — requires sign-in                   |
| API Key Management   | `/keys`       | Protected — requires sign-in                   |
| Usage Analytics      | `/analytics`  | Protected — mocked data, UI is fully rendered  |
| API Status           | `/status`     | Public — mocked incident history               |
| Changelog            | `/changelog`  | Public — driven from `changelog.json` per API  |

## Authentication

The portal uses **Supabase Auth** (`appConfig.authProvider = 'supabase'` in `src/app/config.ts`).

**Why Supabase:**

- `persistSession: true` keeps the JWT in `localStorage` — session survives page reload.
- `autoRefreshToken: true` performs silent token refresh in the background; no manual timer needed.
- Email/password works out of the box on the free tier with no extra setup.
- The adapter sits behind an `AuthProvider` interface (`src/lib/auth/types.ts`), so swapping to Auth0, Firebase, or a custom JWT is a single-file change — no component rewrites.

Protected routes (`/sandbox`, `/keys`, `/analytics`) redirect unauthenticated users to `/login?redirect=<path>`. After sign-in the user is returned to the originally requested page. The guard is wired into TanStack Router's `beforeLoad` so it re-runs on every navigation.

## Adding a new API

Adding a second API to the portal requires **three steps and zero component changes**:

**Step 1 — Drop the spec**

```bash
src/apis/<api-name>/openapi.json    # required: valid OpenAPI 3.x document
src/apis/<api-name>/docs.md         # optional: getting-started guide (Markdown)
src/apis/<api-name>/changelog.json  # optional: versioned changelog entries
src/apis/<api-name>/errors.json     # optional: error reference catalogue
```

**Step 2 — Register the API**

Open `src/apis/api-registry.ts` and add one entry:

```ts
import myApiSpec from './my-api/openapi.json'
import myApiDocs from './my-api/docs.md?raw'      // optional
import myApiChangelog from './my-api/changelog.json' // optional
import myApiErrors from './my-api/errors.json'       // optional

// Inside API_REGISTRY:
{
  id: 'my-api',
  name: 'My API',
  version: '1.0.0',
  baseUrl: 'https://api.example.com/v1',
  description: 'Short description shown in the sidebar.',
  spec: asSpec(myApiSpec),
  docs: myApiDocs,               // optional
  changelog: asChangelog(myApiChangelog), // optional
  errorReference: asErrors(myApiErrors), // optional
  sdks: [
    { lang: 'JavaScript', install: 'npm install my-sdk', repo: 'https://github.com/...' },
  ],
}
```

**Step 3 — Done**

The API appears in the sidebar. Docs, sandbox, changelog, status, SDK links, and error reference all render from the registry automatically.

The `stub-payments` entry in the registry is a minimal working example of this pattern.

## Project structure

```
src/
├── apis/
│   ├── api-registry.ts       # single source of truth — add APIs here
│   ├── pokeapi/              # PokéAPI: openapi.json, docs.md, changelog.json, errors.json
│   ├── tcgdex/               # TCGdex: second demo API (also fully wired)
│   └── stub-payments/        # stub for extensibility demo
├── features/
│   ├── auth/                 # sign-in / sign-up / sign-out UI + hooks
│   ├── docs/                 # spec renderer (parameters, request body, response schemas)
│   ├── sandbox/              # live request builder + code snippet generator
│   ├── keys/                 # API key create / list / revoke
│   ├── analytics/            # usage dashboard (mocked time-series + breakdown table)
│   ├── changelog/            # versioned changelog browser with type filter
│   └── status/               # health indicators + incident feed
├── components/               # shared UI primitives (Badge, Button, Select, CodeBlock…)
├── lib/
│   ├── spec-parser.ts        # OpenAPI → typed domain model
│   ├── snippet-generator.ts  # cURL / fetch / Python snippet generation
│   ├── auth/                 # AuthProvider abstraction + Supabase adapter
│   ├── data/                 # repository interfaces + local-json / mock providers
│   └── sandbox/              # REST executor (useSandboxRequest)
├── routes/                   # TanStack Router file-based routes
└── app/
    └── config.ts             # adapter selection (authProvider, dataSource)
```

## Architecture

For a deeper look at why things are built the way they are — the DAL and Auth provider abstractions, the typed adapter registries, sandbox-always-REST, two-tier search, and per-feature layering — see [ARCHITECTURE.md](ARCHITECTURE.md).

## Tech stack decisions

| Concern          | Choice                      | Reason                                                                 |
| ---------------- | --------------------------- | ---------------------------------------------------------------------- |
| Bundler          | Vite                        | Fast HMR, first-class TypeScript, JSON/raw imports out of the box      |
| Routing          | TanStack Router v1          | Type-safe params and search; `beforeLoad` guards without extra wiring  |
| Server state     | TanStack Query              | Avoids raw `useEffect` for data fetching; mutation + cache invalidation|
| Auth             | Supabase Auth               | Silent refresh + `localStorage` persistence with no manual plumbing    |
| Styling          | Tailwind CSS                | Utility-first; consistent spacing without custom CSS                   |
| Schema           | Zod                         | Runtime OpenAPI type validation at the registry boundary               |
| Testing          | Vitest + React Testing Library | Vite-native; co-located tests                                       |
| Charts           | Recharts                    | Composable, TS-friendly, low bundle overhead                           |
