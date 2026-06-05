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
