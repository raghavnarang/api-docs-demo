# Plan v2 — Sandbox hook strategy + workflow rules

> Snapshot from Entry 006 (prompts.md). Builds on [plan-v1.md](plan-v1.md). Superseded by [plan-v3.md](plan-v3.md).

## Delta from v1

### Sandbox + TanStack Query — decision
Axis corrected from "verb-based" to **imperative-vs-declarative**:
- `useQuery` = declarative + cached + auto-running → app data (docs, keys list).
- `useMutation` = imperative, fires on `.mutate()`, no caching → sandbox execution.

A sandbox "Send" is imperative one-shot (edit params → Send → show status + latency + body, no caching/auto-refetch). So **`useSandboxRequest()` uses `useMutation` for ALL HTTP verbs** (GET/POST/PUT/DELETE). The HTTP method is just a field on the request passed to the always-REST client — it decides the wire request, NOT the TanStack hook choice. Routing GET→`useQuery` would fight the cache (`enabled:false` + manual refetch) and complicate per-fire latency.

### Workflow rules added
1. prompts.md entries must record the polls (each AskUserQuestion + chosen option), not just the outcome.
2. Every plan revision saved as its own `plans/plan-vN.md` (never overwrite prior versions).
3. Each planning prompt's outcome links the `plans/plan-vN.md` it produced.
4. Memory rule `prompt-log-workflow` updated to encode 1–3.

Everything else carries over from [plan-v1.md](plan-v1.md).
