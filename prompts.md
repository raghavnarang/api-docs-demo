## Prompt Log

### Entry 001
- **Tool:** Claude Opus 4.8
- **Goal:** Set up a prompt-logging workflow in prompts.md
- **Prompt:** "I want to add prompts in prompts.md file in current folder. Current folder is empty currently. Whenever I am done with a prompt and its outcome, I want you to add the prompt I used and the outcome as well (crisp but understanble). You can start with current prompt as well. Here is the format for one prompt. In tool you can also mention the model that you are using. and also keep this thing in your memory so that you will auto do it after every prompt."
- **Outcome:** Created prompts.md with this entry. Saved memory to auto-append every future prompt and outcome.

### Entry 002
- **Tool:** Claude Sonnet 4.6
- **Goal:** Fix prompt logging to preserve exact prompt text
- **Prompt:** "I see that you have little modified the prompt, I want you to add excat prompt that I types not modify it, you can generate crisp and understandable outcome, but prompt must be as it is."
- **Outcome:** Fixed Entry 001 to use exact original prompt text. Updated memory rule to preserve prompts verbatim.

### Entry 003
- **Tool:** Claude Sonnet 4.6
- **Goal:** Format prompts.md — bold keys, single line per field
- **Prompt:** "added some changes, make the keys bold eg: tool, goal etc. and every point must come as one line in MD preview"
- **Outcome:** Rewrote all entries with bold keys and single-line fields.

### Entry 004
- **Tool:** Claude Sonnet 4.6
- **Goal:** Switch entry fields to bullet points
- **Prompt:** "use bullet points"
- **Outcome:** Reformatted all entries to use bullet points for each field. Updated memory format.

### Entry 005
- **Tool:** Claude Opus 4.8
- **Goal:** Plan project setup for an extensible API Docs + Sandbox SPA (setup only, hello world)
- **Prompt:** "Lets do the real work now. I want to create a API Docs SPA where external developers can see the APIs and test them in sandbox. I am attaching a pdf for more info on it. The stack & expected filestructure are also mentioned in the pdf. \n\nIn addition to that, the tanstack query must act as DAL, I want the data source to be extensible, we should be able to swap the data source to rest api, graphql api, localstorage, local json files. The DAL must abstract the data source from app, just use the data. \n\nSame abstraction I need to do with Auth, where I can use any auth provider like supabase, firebase, auth0 or any auth provider, and also Custom JWT as well. \n\nBut for sandbox API execution by external devs (users), it must always be rest api.\n\nFor now I just wanted to setup the project, not implement any feature. I should be able to run with a hello world page."
- **Polls (AskUserQuestion):**
  - Router? → **TanStack Router v1**
  - UI state library? → **Zustand**
  - Abstraction scope for setup phase? → **Interfaces + mock default**
  - Styling? → **Tailwind CSS v4**
- **Outcome:** Produced setup plan: Vite + React + TS strict, TanStack Router/Query, Zustand, Tailwind v4, DAL + Auth abstraction layers with mock defaults, sandbox always-REST, hello-world page. Plan snapshot → [plans/plan-v1.md](plans/plan-v1.md).

### Entry 006
- **Tool:** Claude Opus 4.8
- **Goal:** Decide sandbox + TanStack Query strategy; add poll logging + plan versioning to workflow
- **Prompt:** "Can we also use tanstack query's mutation or queries with Sandbox? it must decide if mutation (POST, PUT, DELETE) or Query (GET) based on API method. Or correct me if I wrongly mentioned the order. \n\nPlus in Prompt.md. mention all polls through which you asked me the questions. And add every plan version as md in a separate folder with a version number and mention that versioned plan doc in it's respective prompt outcome."
- **Polls (AskUserQuestion):**
  - Sandbox hook strategy? → **useMutation for all verbs** (imperative one-shot; HTTP method is just a request field to the REST client, not the hook selector)
- **Outcome:** Corrected the axis from verb-based to imperative-vs-declarative — sandbox uses `useMutation` for every verb. Added workflow rules: log polls in entries + save every plan revision as `plans/plan-vN.md` referenced from its entry. Plan snapshot → [plans/plan-v2.md](plans/plan-v2.md).

### Entry 007
- **Tool:** Claude Opus 4.8
- **Goal:** Choose adapter-selection mechanism for DAL/Auth
- **Prompt:** "shouldn't we select DAL/Auth adapters via config instead of env vars? WDYT?"
- **Outcome:** Agreed. Adapter selection moved to a typed `appConfig` single-source-of-truth + type-safe adapter registries (`Record<Kind, () => Adapter>`, exhaustively type-checked); env vars reserved for provider secrets/overrides. Also unlocks the runtime multi-environment switcher bonus. Plan approved. Plan snapshot → [plans/plan-v3.md](plans/plan-v3.md).

### Entry 008
- **Tool:** Claude Opus 4.8
- **Goal:** Initialize git, commit prompts + plans, push to remote (before implementation)
- **Prompt:** "Before implementing the plan lets git init, and commit prompts + push to remote" + "I want prompts and plan in project" + "use raghavvnarang@gmail.com for author"
- **Polls (AskUserQuestion):**
  - GitHub repo visibility? → **Public**
- **Outcome:** Flushed prompt-log backlog (Entries 005–007, plan-v1/v2/v3, memory). Created `.gitignore`. `git init` on `main`, author set to `raghavnarang <raghavvnarang@gmail.com>`. Committed prompts.md + plans/ + .gitignore. Created public repo and pushed → https://github.com/raghavnarang/api-docs-demo.

### Entry 009
- **Tool:** Claude Opus 4.8
- **Goal:** Implement the approved setup plan ([plans/plan-v3.md](plans/plan-v3.md))
- **Prompt:** "Lets implement the plan now"
- **Outcome:** Scaffolded Vite 6 + React 18 + strict TS (built manually to avoid `npm create` prompt on non-empty dir). Added Tailwind v4, TanStack Router v1 + Query v5, Zustand, Zod, ESLint flat + Prettier, Vitest + RTL. Built DAL abstraction (repository interfaces + typed `appConfig` selection + type-safe registry + mock adapter), auth abstraction (`AuthProvider` + `useAuth()` + mock), always-REST sandbox executor, API registry, and lib stubs. Wired QueryClient → Auth → Router provider chain rendering a Hello World page. Fixes during verify: added `vite-env.d.ts` for CSS types, switched to `vitest/config` + bumped Vitest to v3 (deduped a nested vite causing plugin-type clash), eslint `^_` ignore for stub params, stubbed `window.scrollTo` in tests. All green — type-check 0 errors, lint 0 errors (2 benign react-refresh warnings), test passes, build 83.69 kB gzip, dev boots HTTP 200. Committed in 4 atomic conventional commits. Implemented per approved plan → [plans/plan-v3.md](plans/plan-v3.md).

### Entry 010
- **Tool:** Claude Opus 4.8
- **Goal:** Revert in-progress doc edits; decide on continuing vs fresh chat
- **Prompt:** "lets revert the readme and prompts, should I start a new fresh chat?"
- **Outcome:** Reverted README.md + prompts.md to the committed Entry 009 state (dropped the queued Entry 010/boundary edits). Advised staying in this chat — context intact and memory/`plans/` persist either way, so no benefit to resetting.

### Entry 011
- **Tool:** Claude Opus 4.8
- **Goal:** Identify which DAL repository methods the Catalogue & Documentation feature needs
- **Prompt:** "That and which APIs we should have? to accomplish API Catalogue & Documentation?" + clarification "wait not those APIs. I am talking about which DAL APIs we need? in API Repo?"
- **Outcome:** Mapped §2.2 to an `ApiCatalogRepository` surface: `listApis`, `getApi`, `getSpec`, `getDocs`, `getErrorReference`. SDK links fold into `getApi`; three read granularities (light list / metadata / lazy spec). Search deferred to the next prompt.

### Entry 012
- **Tool:** Claude Opus 4.8
- **Goal:** Decide search architecture and plan the Catalogue & Documentation DAL layer
- **Prompt:** "What if we implement the search (behind DAL), and Debounce (on client side)?"
- **Polls (AskUserQuestion):**
  - Scope of this build? → **DAL layer + hooks only** (no UI)
  - Default data source after change? → **Switch to local-json** (mock = test fixtures)
  - Add deps? → **openapi-types** now (react-markdown + remark-gfm deferred to UI step)
- **Mid-plan refinements (rejections):** tests deferred to a separate pass; search scoped to endpoints + descriptions + parameters (§2.2); clarified docs params are read-only (editable params are a Sandbox §2.3 concern).
- **Outcome:** Agreed — `searchEndpoints(q)` lives behind the DAL (swappable impl), debounce is client-side via `useDebouncedValue`. Built: `parseOpenApiSpec`, expanded `ApiCatalogRepository` (6 methods) + query-keys + domain types, shared `endpoint-search` helper, `local-json` adapter (injectable registry) + `mock` (= local-json over fixtures), expanded `ApiDefinition`, `useDebouncedValue` + `features/docs/hooks/use-catalog`. Default switched to `local-json`. Verified: type-check 0, lint 0 errors, build ok, smoke test green, throwaway sanity passed. Plan → [plans/plan-v4.md](plans/plan-v4.md).

### Entry 013
- **Tool:** Claude Opus 4.8
- **Goal:** Review and refine the OpenAPI spec parser
- **Prompt:** "why spec parser is too much complicated?" → (after explanation) "yes" [use operationId for endpoint id] → "lets also add back the ref"
- **Outcome:** Walked through what the parser does (flattens nested paths×methods into a flat `EndpointDef[]`). First trimmed `$ref` resolution as YAGNI (no registered spec used refs); then refined per review: endpoint `id` now prefers the spec's canonical `operationId` (falls back to a `method+path` slug), and re-added local `#/components/...` `$ref` resolution for params/requestBody/responses + path-level shared params + array item types. Verified: type-check 0, lint 0 errors, build ok, sanity covering `$ref` + `operationId` passed.

### Entry 014
- **Tool:** Claude Opus 4.8
- **Goal:** Plan the Catalogue & Documentation UI, then narrow to the spec-parser schema gap + tests
- **Prompt:** "lets plan the UI for API Catalogue & Documentation. Currently we are done with DAL work for local-json and catalog queries are ready, spec-parser is also ready. [...full §2.2 brief: sidebar, per-endpoint docs, params table, request body + response schemas, Getting Started markdown, SDK links, error reference, Cmd/Ctrl+K search, loading/empty/error states, HTTP method colour convention...]" → "doesn't it have requestBody and responses, for the code I selected in spec parser?" → "what is schema content? for request and response?" → "lets add support for body/response field-tables. and let me review the plan" → "if we have one route for per endpoint, doesn't it feels same like sandbox? Dont you think we need a scroll view for every api endpoints under an api?" → "what is the role of snippet generator?" → "for now lets only proceed with spec parser extensibility and it's test cases. I want to review the test cases as well"
- **Polls (AskUserQuestion):**
  - Docs layout? → initially **route-per-endpoint**, then user reconsidered → **scroll-per-API page + anchors + TOC** (route-per-endpoint collides with the Sandbox's per-endpoint view; docs = skimmable reference)
  - Page structure for GS/SDK/Errors? → **all in one scroll + TOC**
  - Markdown? → **react-markdown + remark-gfm** (deferred — UI not built this pass)
  - Cmd+K palette? → **hand-rolled dialog** (deferred)
  - Seed data? → **PokéAPI + stub-payments** (deferred)
  - Handle composition keywords now? → **Add allOf + oneOf/anyOf + map** (close the financial-API gap before UI)
- **Outcome:** Clarified the real gap: spec-parser keeps `contentTypes`/status text but throws away the actual body/response **schemas** needed for field tables. User scoped this pass to **spec-parser only**. Extended `parseOpenApiSpec` with a recursive, `$ref`-resolved `SchemaNode` (flat `required` per property, ordered `properties`, array `items`, `circular` cycle-cut, prefer-JSON content selection) on `requestBody.schema` + each `response.schema` — purely additive. After a robustness review (anyOf/allOf/oneOf are common in real financial specs and were silently rendering blank), added composition handling: `allOf` merge (de-dupe + union required), `oneOf`/`anyOf` → `variants[]` + `composition` tag, `additionalProperties` map marker, OpenAPI 3.1 array-type collapse, and path-item `$ref` deref. Added `src/lib/spec-parser.test.ts` (15 cases: back-compat, inline body, `$ref` response, arrays, nesting, cycle guard, `required[]`, metadata carry-through, content-type selection, graceful unresolvable `$ref`, allOf merge, oneOf/anyOf variants, additionalProperties, 3.1 array type, path-item `$ref`). Snippet-generator confirmed out of scope (Sandbox §2.3). Verified: 15/15 tests pass, type-check 0, lint 0 errors. UI deferred to next pass. Plan snapshot → [plans/plan-v5.md](plans/plan-v5.md).

### Entry 015
- **Tool:** Claude Opus 4.8
- **Goal:** Build the core API Catalogue & Documentation UI (§2.2) — shell, sidebar TOC, scroll-per-API docs page rendered from the spec, states, badges, caching, seed data
- **Prompts (verbatim, in order):**
  1. "what are these validation constraints?"
  2. "Continue the UI Plan"
  3. "Here is one of the OpenAPI spec for TCG Pokemon Card Game https://api.apis.guru/v2/specs/tcgdex.net/2.0.0/openapi.json"
  4. "I think I have found pokeapi spec

     https://gist.githubusercontent.com/NiccoMlt/073b18934a6001fc5a2414c590e3b8ba/raw/e85c7a1012530defb41978589ffa4342f1297230/openapi.yaml"
  5. "Before commiting can you explain me in which format we are parsing the openapi spec, and why?"
  6. "You mentioned that DAL is returning the parsed EndpointDef/SchemaNode. What if we provide OpenAPI Spec via DAL, and frontend should parse that?

     Asking because future rest apis will have less load parsing the openAPI spec on each request, or maintaining a parsed version, or cache the parsed versions. WDYT?"
  7. "We can come on client side cache later. lets suppose we are using rest api, if we are parsing on client side, what should be the response from backend for search API? currently DAL is providing the parsed entries for search? little confused here"
  8. "Wait, as we have already discussed if getSpec is already providing us the full openAPI Spec json. I think we should search on frontend, because ids are also getting created on frontends.

     I am thinking of two types of searches, one on frontend level, which can happen on per API level only. One for backend (behind DAL), which responds with which api has that full text keyword in endpoint, description or param. then frontend redirect to that API page, and hit frontend level search for API that I have mentioned for first search type.

     As we have OpenAPI file already available, then we can search on per API basis, for overall basis, backend can redirect us to the API and frontend can do search localy. WDYT? is it okay?"
  9. "We must also cache the parsed openAPI spec, so that next call must not parse the api again (for local-json). and for separate backend, caching can be flushed after a specific interval, so that if any new changes on backend, it can be refreshed."
  10. "I also want to kill the third dup parse at single API tier search, when we will implement 2-tier search"
  11. "why same kind of schema in the selection?"
  12. "Scroll spy's intersection observer is not working correctly, when clicked on an endpoint, sometimes the active background goes above or below, not at the clicked one"
  13. "doesnt onScroll and get BoundingClient Rect have negative impact on performance?"
  14. "Can we not achieve same thing with intersectionObserver?"
  15. "When I land directly at API page, it is giving null as active element"
  16. "This is not the issue, please revert. Even when I scroll the active id is null. Only it works when I come from docs page to api. when I refresh app on API page, it is not working active is always null, even on scrolling"
  17. "it works, but it looks hacky :P cannot we do it on some ready js event?"
  18. "why extra cleanup useEffect, Cannot we move the cleanup in previous useEffect?"
- **Polls (AskUserQuestion):**
  - Scope this pass? → **Core docs first** (defer Cmd+K search, Getting Started markdown, SDK links, error reference)
  - Extend parser for display fields? → **Add constraints/readOnly/discriminator now**
  - Seed data? → initially hand-authored, then (prompts 3–4) user supplied real specs → **real PokéAPI (gist YAML→JSON) + real TCGdex (apis.guru) + hand stub-payments**, vendored as JSON
  - Spec loading? → **vendor JSON into repo**
  - Scroll-spy impl? → **IntersectionObserver + bottom sentinel** (after rejecting scroll-listener as too heavy and rAF-retry as hacky)
- **Outcome:** Shipped the core, fully spec-driven Catalogue & Documentation UI. Breakdown:
  - **Parser:** added validation constraints + `readOnly`/`writeOnly` + `discriminator` to `SchemaNode`; added a unique-endpoint-id guard (real specs omit/dupe operationIds — TCGdex had 31/33 null).
  - **Shared primitives (`components/`):** HTTP colour conventions + Method/Status badges; Skeleton/Empty/Error states; `QueryBoundary` (standardizes the three states); `ParamsTable`; recursive `SchemaViewer` (nested/array/oneOf-variants/map/readOnly/circular/rules cell).
  - **Routing/shell:** pathless `AppShell` layout + sidebar TOC; `/`→`/docs` redirect; catalogue grid; `/docs/$apiId` scroll page with anchored `EndpointSection`s + hash navigation.
  - **Caching:** `useApiEndpoints` parses the raw spec once and caches it via TanStack Query (TTL `Infinity` for static local-json, finite for REST) — removes the double parse.
  - **Scroll-spy:** IntersectionObserver + bottom sentinel, **co-located in `ApiDocsPage`** (publishes active id to a small zustand store the sidebar reads) — fixes the hard-refresh DOM-readiness race without polling.
  - **Seed:** vendored real PokéAPI (96 GET) + TCGdex (33 GET, `$ref`-heavy) + hand-authored stub-payments (POST/DELETE, oneOf+discriminator+constraints), all three registered; `resolveJsonModule` enabled.
  - **Search decisions (deferred pass):** raw spec from DAL + client parse; two-tier search (frontend per-API + DAL API-level `searchApis`, id-agnostic since anchor ids are frontend-authoritative); Tier-1 reuses the cached `useApiEndpoints` (no third parse).
  - **Tests:** conventions, SchemaViewer, EndpointSection, QueryBoundary, group-endpoints (34 total).
  - **Verified:** 34/34 tests, type-check 0, lint 0 errors, build ~99 KB gzip.
  - **Deferred:** Cmd+K search, Getting Started markdown, SDK links, error reference.
  - **Plan snapshot:** [plans/plan-v6.md](plans/plan-v6.md).

### Entry 016
- **Tool:** Claude Opus 4.8
- **Prompt:** "Add clickable Link icon besides endpoint to copy it's hashed included link"
- **Outcome:** Added a reusable `CopyLinkButton` (`src/components/CopyLinkButton.tsx`) that copies a deep link to the on-page anchor (`{origin}{pathname}#{anchorId}`) with a link→check icon swap and brief "Copied!" feedback; fails quietly when the clipboard API is unavailable. Wired it beside the path in each `EndpointSection` header. Added a test mocking `navigator.clipboard.writeText`. Verified: 35/35 tests, type-check 0, lint 0 errors.

### Entry 017
- **Tool:** Claude Opus 4.8
- **Prompt:** "after every prompt put entry in prompts.md proactively as single entry"
- **Outcome:** Updated the prompt-log workflow memory: ONE entry per prompt (never bundle multiple prompts into one entry — questions, clarifications and refinements each get their own entry), appended proactively after each prompt, with the prompt kept verbatim. Prior bundled entries (014, 015) left as-is; rule applies going forward.

### Entry 018
- **Tool:** Claude Opus 4.8
- **Prompt:** "Spec parser is generating ID wrong, extra _
get_rarities_rarity_"
- **Outcome:** Fixed the fallback slug in `parseOpenApiSpec`: a trailing path token like `{rarity}` left a trailing `_` (e.g. `get_rarities_rarity_`). Added `.replace(/^_+|_+$/g, '')` to trim leading/trailing underscores. Added a regression test asserting `/rarities/{rarity}` → `get_rarities_rarity`. Verified: 20 parser tests pass, type-check 0, lint 0 errors. (Also noted: this prompt-log commit also carries the uncommitted Entry 017.)

### Entry 019
- **Tool:** Claude Opus 4.8
- **Goal:** Plan the deferred Cmd/Ctrl+K search pass (§2.2)
- **Prompt:** "check reference from plans/plan-v6.md prompts.md and continue the work by planning of the deferred search pass with search dialog. More info in PDF"
- **Polls (AskUserQuestion):**
  - Result UX? → **endpoint-level deep links**, but user asked how multiple matches per keyword are handled
  - Refactor DAL search? → **Replace with id-agnostic `searchApis`**
  - Polish scope? → **loading/empty/error states only** (no arrow-nav, highlight, or recent-searches)
  - Multi-match handling? → **list every matching endpoint**, grouped by API, each deep-linking to its own anchor
- **Plan-mode refinements (rejections):** "what if any openapi is not in cache?" (→ on-demand fetch via shared `useQueries`, parse-at-most-once); "where do you use `specMatchesQuery`? on REST there's no spec in hand" (→ `searchApis` is the DAL abstraction; local-json scans bundled specs, REST does a `fetch` — moved the frontend matcher to neutral `src/lib/endpoint-match.ts`); "fetch parsed cache in `specMatchesQuery`, if available" (→ cache-first assembly in the frontend hook); "how it works for remote backend vs local json" (→ documented per-backend rationale).
- **Outcome:** Approved plan → [plans/plan-v6.md](plans/plan-v6.md) (search dialog plan written to the plan file). Architecture locked: Tier-2 DAL `searchApis(query)` returns id-agnostic `{apiId, apiName}` (local-json raw spec scan, REST a server call — no parse, no ids); Tier-1 frontend `endpointMatchesQuery` over the shared cached parse produces anchor ids. Hand-rolled Cmd/Ctrl+K dialog lists every matching endpoint grouped by API, each deep-linking to `/docs/$apiId#<endpointId>`.

### Entry 020
- **Tool:** Claude Opus 4.8
- **Goal:** Review whether the cache-first `useGlobalSearch` is over-engineered
- **Prompt:** "Can you review the implementation if showing results for cached entries is okay? is it not over-engineered?"
- **Outcome:** Agreed it was over-engineered. The hand-rolled cache-first partition (`queryClient.getQueryData` + manual dedupe) duplicated what TanStack Query's `useQueries` already does: keyed by the shared `endpointsQueryOptions`, it returns cached parses instantly (no refetch/re-parse) and parses misses once into the same cache the docs page reuses. The manual read was also non-reactive. Simplified to `useApiSearch` (Tier-2) → `useQueries` over matched ids → `endpointMatchesQuery` filter; ~75 → ~55 lines, no imperative cache read. Both original constraints still hold (no third parse; cache reused if present). Verified: type-check 0, lint 0 errors, 53 tests pass.

### Entry 021
- **Tool:** Claude Opus 4.8
- **Goal:** Replace tiny/inconsistent unicode glyph icons app-wide
- **Prompt:** "This icon is not good. it is very small. Can we better set of icons all over app?"
- **Outcome:** Added `lucide-react` (verified package identity — `lucide.dev`, `lucide-icons/lucide`, ISC; v1.17.0 is legit, just past the model's training cutoff). Replaced the glyphs (`⌕`, `◌`, `⚠`) and CopyLinkButton's hand-drawn SVGs with lucide icons (`Search`, `Inbox`, `AlertTriangle`, `Link2`/`Check`) in the search trigger/dialog, `EmptyState`, `ErrorState`, and `CopyLinkButton`. Bundle +0.76 kB gzip (tree-shaken). Verified: type-check 0, lint 0 errors, 53 tests pass, build ~103 kB gzip.

### Entry 022
- **Tool:** Claude Opus 4.8
- **Goal:** Note a manual edit + recover broken commit history
- **Prompt:** "I have changed to 500ms"
- **Outcome:** Acknowledged the user's manual `useDebouncedValue` default change (300→500ms) and folded it into the search-hooks commit. While committing, caught that an earlier commit had captured only a file rename (0 content) — leaving HEAD in a broken mixed state (`index.ts` still importing the old `searchEndpoints` while committed hooks already called `searchApis`); only the working tree type-checked. Recovered with `git reset --soft` to the pre-session base and recommitted the whole pass as 8 clean, individually-consistent atomic commits (dal → matcher → hooks → deps → icons → dialog → shell → tests). Final HEAD: type-check 0, lint 0 errors, 53 tests pass, no stray old refs, clean tree.
