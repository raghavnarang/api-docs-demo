# Plan v8 — API Key Management (§2.4)

## Context
Auth (§2.1), Catalogue & Docs (§2.2), Sandbox (§2.3) are done. Build §2.4 API Key
Management: a logged-in dev creates named keys (sandbox/production, optional expiry),
sees them listed masked (last-4 only) with environment badge / created / last-used /
status, revokes with a confirm dialog, and on creation sees the full secret exactly
once with copy + a "won't be shown again" warning.

**Architectural driver (user steer):** the feature must be data-source-agnostic and
swap to a remote backend by changing only `appConfig.dataSource`. TanStack Query stays
unaware of the source. Identity flows as the **auth token** to the DAL — the owner is
resolved *behind* the DAL. No `userId` is ever sent as a fetch/authorization parameter
(`session.user.id` is used only as a local React Query cache-partition key, never
transmitted). For `local-json`, data lives in `localStorage`, scoped per resolved owner.

The `/keys` route, auth guard, and sidebar link already exist (`KeysPanel` is a
placeholder) — **no routing/nav changes needed**, satisfying the no-component-change rule.

## Decisions (polls)
1. Revoke → **keep key, mark `revoked`** (greyed row + status badge, reflected immediately).
2. Scoping → **token-based**: repo methods take the token; owner resolved behind the DAL
   (decode JWT `sub`, fallback to raw token for the opaque mock token). No userId sent.
3. Confirm dialog → **new shared `Modal` + `ConfirmDialog` primitives** in `components/`.
4. Secret → **show once, never again**: `createKey` returns the plaintext once; storage
   keeps only `maskedKey` (last-4) + metadata, mimicking hashed-secret backends.

## Reuse
`Button` (primary/danger + loading), `Input`, `CodeBlock` (one-time secret copy),
`EmptyState`/`ErrorState`/`Skeleton` for the three states, `useAuth().session`,
`getDataSource()` + `queryKeys` factory, SearchDialog's overlay pattern as the basis for
the new `Modal`. Validation mirrors `features/auth/validation.ts` (Zod).

## Build

### 1. DAL — domain + contract (data-source-agnostic)
- **`src/lib/data/types.ts`** — add:
  ```ts
  export type ApiKeyEnvironment = 'sandbox' | 'production'
  export type ApiKeyStatus = 'active' | 'revoked'
  export interface ApiKey {
    id: string; name: string; environment: ApiKeyEnvironment
    maskedKey: string            // e.g. "sk_sandbox_••••••••3f9a" — never the secret
    createdAt: string; lastUsedAt: string | null; expiresAt: string | null
    status: ApiKeyStatus
  }
  export interface CreateApiKeyInput {
    name: string; environment: ApiKeyEnvironment; expiresAt?: string | null
  }
  export interface CreatedApiKey extends ApiKey { secret: string } // returned ONCE
  ```
- **`src/lib/data/repositories.ts`** — add `ApiKeyRepository`:
  ```ts
  listKeys(token: string): Promise<ApiKey[]>
  createKey(token: string, input: CreateApiKeyInput): Promise<CreatedApiKey>
  revokeKey(token: string, id: string): Promise<void>
  ```
  Doc note: token is identity; a REST adapter forwards it as `Authorization` and the
  server resolves the owner — never an `ownerId` param.
- **`src/lib/data/data-source.ts`** — add `keys: ApiKeyRepository` to `DataSource`.
  (`rest`/`graphql` registry entries are `notImplemented` factories that throw on
  invoke, so no literal needs the new field — no compile break.)
- **`src/lib/data/query-keys.ts`** — add:
  ```ts
  keys: {
    all: ['keys'] as const,
    list: (owner: string) => [...queryKeys.keys.all, 'list', owner] as const,
  }
  ```

### 2. local-json provider implementation
- **`src/lib/data/providers/local-json/owner.ts`** (new) — `resolveOwner(token)`:
  base64-decode the JWT payload, return `sub`; if not a JWT, return the raw token.
  Keeps the DAL self-contained (no import of auth context).
- **`src/lib/data/providers/local-json/keys-store.ts`** (new) — localStorage CRUD under
  `devportal:apikeys:<owner>`: `read/write` JSON array, `crypto.getRandomValues`-based
  secret `sk_<sandbox|live>_<hex>`, `maskedKey` = prefix + `••••••••` + last-4. Pure,
  testable, no React.
- **`src/lib/data/providers/local-json/index.ts`** — build `keys: ApiKeyRepository`
  alongside `catalog`, delegating to `keys-store` after `resolveOwner(token)`; return
  `{ catalog, keys }`. `createKey` persists metadata only (drops the plaintext) and
  returns `CreatedApiKey`; `revokeKey` flips `status`. `mock` inherits automatically
  (it calls `createLocalJsonDataSource`).

### 3. Feature hooks — `src/features/keys/hooks/use-api-keys.ts`
`const keysRepo = () => getDataSource().keys`. All read `useAuth().session`:
- `useApiKeys()` — `useQuery({ queryKey: keys.list(session.user.id), queryFn: () =>
  keysRepo().listKeys(session.token), enabled: !!session })`.
- `useCreateApiKey()` — `useMutation(createKey(token, input))`, `onSuccess` invalidate
  `keys.all`; returns `CreatedApiKey` to the caller for the one-time reveal.
- `useRevokeApiKey()` — `useMutation(revokeKey(token, id))`, invalidate `keys.all`.
- **`src/features/keys/validation.ts`** — Zod: `name` (1–40 chars), `environment` enum,
  `expiresAt` optional ISO date that must be in the future.

### 3b. Clear React Query cache on logout — `src/lib/auth/auth-context.tsx`
`AuthContextProvider` sits inside `QueryClientProvider` (see `app/providers.tsx`), so
it can `useQueryClient()`. Wrap `signOut` to call `queryClient.clear()` after the
provider sign-out — prevents a second account on the same browser from reading the
first user's cached key list (and any other cached queries). **localStorage is NOT
cleared** — it is the mock backend; owner isolation (`resolveOwner`) keeps each
account's stored keys separate and persistent across sessions, exactly like a real API.

### 4. Shared primitives — `src/components/`
- **`Modal.tsx`** — overlay (`fixed inset-0 z-50 bg-slate-900/40`), centered panel,
  `role="dialog" aria-modal`, labelled title, Esc-to-close, click-outside close, focus
  the panel on open (generalizes SearchDialog's pattern).
- **`ConfirmDialog.tsx`** — built on `Modal`: title, message, confirm/cancel, `danger`
  variant + `loading`. Used for revoke. (+ light tests for both.)

### 5. Feature UI — `src/features/keys/components/`
- **`KeysPanel.tsx`** (rewrite) — header + "Create key" button; renders `KeyList`;
  owns dialog open-state. Handles loading (Skeleton) / empty (EmptyState) / error
  (ErrorState).
- **`KeyList.tsx`** — rows: name, `EnvironmentBadge`, `maskedKey` (mono), created &
  last-used (`Never` when null), `StatusBadge`-style status, expired hint when
  `expiresAt < now`, Revoke button (disabled if already revoked).
- **`CreateKeyDialog.tsx`** — `Modal` + form (name `Input`, environment select, native
  `type="date"` expiry). On submit → create → swap to reveal step.
- **`KeyRevealDialog.tsx`** (or reveal step) — full secret via `CodeBlock` copy + amber
  "you won't see this again" warning; Done closes and the list shows only masked.
- **`RevokeKeyDialog.tsx`** — `ConfirmDialog` wired to `useRevokeApiKey`.
- **`EnvironmentBadge.tsx`** — small pill: sandbox (slate/blue) vs production (amber),
  consistent with the project's badge convention.

### 6. Tests
- `keys-store.test.ts` — create→list→revoke; masking (only last-4 exposed); secret
  returned once and **not** persisted; owner isolation (different tokens → different
  buckets) — jsdom `localStorage`.
- `validation.test.ts` — name bounds, environment enum, future-date rule.
- `KeysPanel`/`KeyList` RTL test — loading / empty / error / populated states.

### 7. Docs / logging (project convention)
- Create `plans/plan-v8.md` (this plan, project copy).
- Append one verbatim entry to `prompts.md` (Tool/Goal/Prompt/Polls/Outcome) per the
  established workflow.
- Atomic Conventional Commits per layer (e.g. `feat(keys): …`, `feat(components): add
  Modal + ConfirmDialog primitives`, `test(keys): …`), Claude co-author footer.

## Extensibility / swap story
To move keys to a real backend: implement `ApiKeyRepository` in the `rest` adapter
(token → `Authorization` header, server resolves owner) and flip `appConfig.dataSource`
to `rest`. Hooks, query keys, and every component are unchanged — they only know the
repository interface.

## Verify
type-check 0, lint 0, tests pass, build green. Manual: sign in → `/keys` →
Create (name + sandbox + future expiry) → full secret shown once, copyable → Done →
list shows masked + sandbox badge + created date + "Never" last-used → reload persists
(localStorage) → Revoke → confirm dialog → row immediately shows `revoked`, button
disabled → sign out (React Query cache cleared) / sign in as a different account →
previous user's keys not visible (cache cleared + owner isolation) → sign back in as
the first account → keys still there (localStorage persisted, like a real backend).
