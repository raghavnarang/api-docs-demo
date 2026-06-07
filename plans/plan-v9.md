# Plan — §2.5 Usage Analytics Dashboard

## Context

Assignment §2.5 needs a per-key usage analytics dashboard: call volume, error rate
(4xx/5xx), avg latency over **7-day and 30-day** windows, a **time-series chart**, and a
**per-endpoint breakdown table**. Mocked data is acceptable — UI structure + code quality
are what's graded.

Follow the same swappable architecture as §2.4 Keys (Entry 036): a new DAL repository
contract + `local-json` adapter generating mocked metrics, fronted by TanStack Query hooks
that stay **unaware of the data source**. Identity flows as the session `token`; the owner is
resolved behind the DAL (`resolveOwner`), `session.user.id` only partitions the query cache.
Swap to a REST backend later = flip `appConfig.dataSource`, zero component change.

**Decisions (user-confirmed):** Recharts for the chart (lazy-loaded chunk, like
`BodyEditor`) · deterministic seeded mock data (stable per `owner+keyId+window`) · per-key
selector + 7d/30d toggle.

## Design

### 1. DAL layer

**`src/lib/data/types.ts`** — add domain types (data-source-agnostic):
```ts
export type UsageWindow = '7d' | '30d'
export interface UsageSummary {
  totalCalls: number
  errors4xx: number
  errors5xx: number
  errorRate: number     // (errors4xx+errors5xx)/totalCalls, 0..1
  avgLatencyMs: number
}
export interface UsageTimePoint {
  date: string          // ISO date (YYYY-MM-DD)
  calls: number
  errors: number
  avgLatencyMs: number
}
export interface EndpointUsage {
  method: string        // GET/POST/...
  path: string
  calls: number
  errorRate: number     // 0..1
  avgLatencyMs: number
}
export interface UsageReport {
  keyId: string
  window: UsageWindow
  summary: UsageSummary
  series: UsageTimePoint[]      // one point per day (7 or 30)
  endpoints: EndpointUsage[]    // per-endpoint breakdown
}
```

**`src/lib/data/repositories.ts`** — add contract (mirror `ApiKeyRepository` token-based identity doc):
```ts
export interface UsageAnalyticsRepository {
  getKeyUsage(token: string, keyId: string, window: UsageWindow): Promise<UsageReport>
}
```

**`src/lib/data/data-source.ts`** — add `analytics: UsageAnalyticsRepository` to `DataSource`.

**`src/lib/data/query-keys.ts`** — add namespace:
```ts
analytics: {
  all: ['analytics'] as const,
  usage: (owner: string, keyId: string, window: string) =>
    [...queryKeys.analytics.all, 'usage', owner, keyId, window] as const,
},
```

### 2. local-json adapter

**New `src/lib/data/providers/local-json/analytics-store.ts`** — deterministic mock generator:
- Tiny seeded PRNG: `xfnv1a(string)` hash → `mulberry32(seed)` (well-known small impls, inline).
- Seed string = `${owner}:${keyId}:${window}` → stable across re-renders/refetch/reload.
- Build `series` of N days (7 or 30) ending today; each day's `calls`/`errors`/`avgLatencyMs`
  drawn from the seeded PRNG within sane ranges. Summary = aggregate of series.
- `endpoints`: pull a handful of real paths+methods from `API_REGISTRY` specs
  (`registry[i].spec.paths`, take first ~6 method/path pairs) so the breakdown reflects
  registered APIs without hardcoding endpoint data in JSX; assign seeded per-endpoint metrics
  whose call totals reconcile with the summary.
- Export `getKeyUsage(owner, keyId, window): UsageReport`.

**`src/lib/data/providers/local-json/index.ts`** — wire it:
```ts
import * as analyticsStore from './analytics-store'
...
const analytics: UsageAnalyticsRepository = {
  async getKeyUsage(token, keyId, window) {
    return analyticsStore.getKeyUsage(resolveOwner(token), keyId, window)
  },
}
return { catalog, keys, analytics }
```
`mock` adapter inherits automatically (it delegates to `createLocalJsonDataSource`).
`rest`/`graphql` `notImplemented` stubs need no change (they throw on access).

### 3. Feature hook — `src/features/analytics/hooks/use-analytics.ts`
Mirror `use-api-keys.ts`:
```ts
const analyticsRepo = () => getDataSource().analytics
export function useKeyUsage(keyId: string, window: UsageWindow) {
  const { session } = useAuth()
  return useQuery({
    queryKey: queryKeys.analytics.usage(session?.user.id ?? 'anonymous', keyId, window),
    queryFn: () => analyticsRepo().getKeyUsage(session!.token, keyId, window),
    enabled: !!session && keyId.length > 0,
  })
}
```

### 4. UI — `src/features/analytics/components/`
Reuse shared primitives (`QueryBoundary`, `EmptyState`, `ErrorState`, `SkeletonLines`,
`MethodBadge`, `Button`) and Tailwind conventions (`slate/blue/red`, `max-w-4xl`).

- **`UsageAnalyticsPage.tsx`** (route component) — orchestrator:
  - `useApiKeys()` for the key list. If **no keys** → `EmptyState` ("No API keys yet",
    link to `/keys`). Loading/error → skeleton/`ErrorState`.
  - Local UI state: selected `keyId` (default first key), `window` (default `'7d'`).
  - Key dropdown (name + `EnvironmentBadge`) + 7d/30d segmented toggle.
  - `useKeyUsage(keyId, window)` → `QueryBoundary` wrapping `MetricCards` + `UsageChart`
    + `EndpointBreakdownTable`.
- **`MetricCards.tsx`** — three cards: Total calls, Error rate (% with 4xx/5xx split),
  Avg latency (ms). Plain `div` cards (no Card primitive exists).
- **`UsageChart.tsx`** — `React.lazy` wrapper + `Suspense` fallback skeleton so Recharts is a
  separate chunk (pattern from `BodyEditor.tsx`). Inner `UsageChartImpl.tsx` renders a Recharts
  responsive line/area chart of `series` (calls + errors over time).
- **`EndpointBreakdownTable.tsx`** — table: `MethodBadge` + path + calls + error rate + avg
  latency. Colour conventions reused.

### 5. Routing + nav
- **New `src/routes/analytics.tsx`** — `createRoute({ getParentRoute: () => authenticatedRoute,
  path: '/analytics', component: UsageAnalyticsPage })` (protected, mirrors `routes/keys.tsx`).
- **`src/router.tsx`** — add `analyticsRoute` to the `authenticatedRoute.addChildren([...])` array.
- **`src/features/docs/components/Sidebar.tsx`** — add a Portal nav `<Link to="/analytics">` with
  a `lucide-react` `BarChart3` icon, matching the existing `/keys` link markup.

### 6. Dependency
`npm install recharts`. Keep it off the main bundle via the lazy chart chunk.

## Critical files
- Modify: `src/lib/data/types.ts`, `repositories.ts`, `data-source.ts`, `query-keys.ts`,
  `providers/local-json/index.ts`, `src/router.tsx`, `src/features/docs/components/Sidebar.tsx`,
  `package.json`.
- New: `src/lib/data/providers/local-json/analytics-store.ts`,
  `src/features/analytics/hooks/use-analytics.ts`,
  `src/features/analytics/components/{UsageAnalyticsPage,MetricCards,UsageChart,UsageChartImpl,EndpointBreakdownTable}.tsx`,
  `src/routes/analytics.tsx`.

## Tests (Vitest + RTL)
- `analytics-store.test.ts`: determinism (same seed → identical report; different
  `keyId`/`window`/`owner` → different); series length = 7 vs 30; `errorRate`/summary
  reconcile with series; endpoints derived from registry.
- `use-analytics`/component tests: `UsageAnalyticsPage` renders empty state with no keys;
  renders cards/table given a report (mock the hook); window toggle + key select update query.

## Verification
1. `npm run type-check` → 0 errors · `npm run lint` → 0 errors · `npm test` → all pass.
2. `npm run dev`: sign in → create a key (if none) → open **Usage Analytics** in sidebar →
   confirm cards, chart, and per-endpoint table render; toggle 7d/30d (chart point count
   30↔7); switch keys (metrics change, stay stable on re-render/reload — deterministic).
3. Sign out / sign in as a second user → metrics differ (owner-seeded), no cross-account leak.
4. `npm run build` green; verify Recharts lands in its own lazy chunk, main bundle not bloated.
