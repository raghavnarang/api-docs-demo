# Plan v11: Changelog Feature (§2.7) — per-API fetch (as built)

> Revises plan-v10: fetch one API's changelog at a time (Sandbox pattern) instead
> of aggregating all APIs.

## Context

§2.7: versioned changelog entries per API, loaded from JSON, types
Breaking/Feature/Fix (colour-coded), filterable by API and type. §4 lists
`changelog.json` as a registry drop-in (`ApiDefinition.changelog?`). Data is
registry-driven (real JSON per API).

**Revised UX:** the page fetches ONE API's changelog at a time, driven by an API
picker — like the Sandbox fetches per selection. Selection persists in the URL
search param (`/changelog?api={apiId}`, shareable/deep-linkable). A type filter
narrows the loaded list client-side.

Because the fetch is strictly per-API registry data — identical to `getDocs(id)` /
`getErrorReference(id)` — changelog folds onto the existing `ApiCatalogRepository`.
**No dedicated repository, no store file, no `DataSource` change.**

Decisions: standalone `/changelog` page; three types (Breaking=red, Feature=green,
Fix=blue).

## Data shape

Per-API entries carry no `apiId`/`apiName` (the page knows the selected API):
```ts
export type ChangelogType = 'breaking' | 'feature' | 'fix'
export interface ChangelogEntry {
  id: string; version: string; date: string   // ISO YYYY-MM-DD
  type: ChangelogType; title: string; description: string
}
```
JSON authored newest-first; adapter returns as-is (mirrors `getErrorReference`).

## Files

**Create:**
- `src/apis/{pokeapi,tcgdex,stub-payments}/changelog.json` — 3–5 entries each.
- `features/changelog/hooks/use-changelog.ts` — `useApiChangelog(apiId)` wrapping
  `catalog().getChangelog(apiId)`, gated `enabled: apiId.length > 0`.
- `features/changelog/components/ChangelogPage.tsx` — reads `?api` (default first
  `useApis()` entry), picker + type filter, `QueryBoundary`. `navigate({search})`
  on picker change.
- `ChangelogApiPicker.tsx` (native `<select>`), `ChangelogTypeFilter.tsx`
  (segmented), `ChangelogEntryCard.tsx` (badge/version/date/title/description).
- `ChangelogPage.test.tsx`.
- `routes/changelog.tsx` — public under `appLayoutRoute`, `validateSearch {api?}`.

**Modify:**
- `api-registry.ts` — `changelog?: ChangelogEntry[]` + 3 JSON imports + `asChangelog`.
- `types.ts` — `ChangelogType`, `ChangelogEntry`.
- `repositories.ts` — `getChangelog(id)` on `ApiCatalogRepository`.
- `local-json/index.ts` — `getChangelog(id) → find(id)?.changelog ?? []`.
- `query-keys.ts` — `apis.changelog(id)`.
- `conventions.ts` — `changelogTypeColor`.
- `router.tsx` — register `changelogRoute`.
- `Sidebar.tsx` — "Changelog" nav link (`ScrollText`).

## CTA (relocated, see Entry 052)

CTAs live on the **docs page**, not the changelog page: a "View changelog"
(`→ /changelog?api={apiId}`) link beside the existing "View status" in
`ApiDocsPage`.

## Verification

`npm run dev` → `/changelog`: first API auto-selected, newest-first colour-coded
entries; picker switches API + updates URL; type filter narrows; CTAs on docs page
navigate. lint + type-check clean; `ChangelogPage.test.tsx` passes.
