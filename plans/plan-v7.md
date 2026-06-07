# Plan v7 — Interactive Sandbox (§2.3)

## Context
Auth (§2.1) and Catalogue & Docs (§2.2) are done. Build the §2.3 Interactive
Sandbox: a logged-in dev builds a live HTTP request against any registered API,
fires it at the real endpoint (no mocks), sees formatted JSON + status badge +
latency, and copies accurate cURL / JS (fetch) / Python (requests) snippets.

Foundation already present but inert: `executeRequest` (rest-client), a throwing
`generateSnippet` stub, the `/sandbox` route behind the auth guard, a placeholder
`SandboxPanel`, and a sidebar link.

## Decisions (polls)
1. Entry point → **Selectors + docs deep-link** (`/sandbox?api=&endpoint=`).
2. Body editor → **CodeMirror 6** (`@uiw/react-codemirror` + `@codemirror/lang-json`).
3. Auth inject → **Inject with toggle** (`Authorization: Bearer <session.token>`, disable for public APIs).
4. Scope → **Full §2.3 only** (defer bonus request-history/replay/HAR).

## Reuse
MethodBadge/StatusBadge + http conventions, Button/Input/QueryBoundary/Empty/Error/Skeleton,
clipboard pattern from CopyLinkButton, `useApis`/`useApiEndpoints` (shared cache, parse-once),
`useAuth().session.token`, `EndpointDef`/`SchemaNode`, `SandboxRequest`/`executeRequest`.

## Build
- **lib (pure, tested):**
  - `lib/sandbox/build-request.ts` — assemble `SandboxRequest` from editable form
    (path substitution+encode, query string, header merge, Bearer inject that never
    overrides a user Authorization, JSON body for non-GET). `tryParseJson` helper.
  - `lib/sandbox/form-init.ts` — seed param rows + JSON body skeleton from `EndpointDef`
    (skip readOnly, prefer example/default, first union variant).
  - `lib/snippet-generator.ts` — cURL/JS/Python from the same assembled request
    (Python emits a native dict literal: True/False/None).
- **components/CodeBlock.tsx** — monospace block + copy.
- **features/sandbox:** `hooks/use-sandbox-request.ts` (`useExecuteRequest` mutation +
  `useSandboxForm` controller); `SandboxPanel` + `EndpointSelector`, `RequestBuilder`,
  `ParamRows`, `BodyEditor` (lazy-loaded CodeMirror), `AuthInjectToggle`, `ResponseViewer`,
  `SnippetTabs`.
- **routing:** `/sandbox` `validateSearch` `{ api?, endpoint? }`, preloaded + written back.
- **docs deep-link:** "Try in sandbox" `Link` in `EndpointSection` (needs `apiId` from `ApiDocsPage`).

## Perf
CodeMirror is heavy → `BodyEditor` is `React.lazy` + `Suspense`, kept out of the main
chunk (split: main ~230 KB gzip, BodyEditor ~138 KB gzip loaded on demand).

## Verify
type-check 0, lint 0, tests pass, build green; manual: sign in → /sandbox → PokéAPI →
GET /pokemon/{name} → pikachu → Send → live 200 + latency + JSON; copy cURL runs in a
terminal; auth toggle adds/removes the bearer header; docs Try-in-sandbox preloads;
invalid JSON blocks Send.
