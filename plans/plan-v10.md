# Plan v10: Changelog Feature (§2.7) — initial (aggregate) design

> Superseded within the session by plan-v11 (per-API fetch). Kept as the first revision.

## Context

Assignment §2.7: versioned changelog entries per API, loaded from a JSON file,
types Breaking/Feature/Fix (colour-coded), filterable by API and by type. §4
(extensibility) lists `changelog.json` as a drop-in and the required `ApiDefinition`
shape includes `changelog?`. So changelog is registry-driven (real JSON files per
API), not PRNG-generated.

Decisions: standalone `/changelog` page only; three types
(Breaking=red, Feature=green, Fix=blue).

## Approach (initial)

Changelog is global + registry-backed (like status), so its own
`ChangelogRepository` in `DataSource`. A `changelog-store.ts` reads the registry's
`changelog` field, stamps `apiId`/`apiName`, sorted newest-first. The page
aggregates ALL APIs' entries with two segmented filters (API + type), both
client-side.

## Data shape

```ts
export type ChangelogType = 'breaking' | 'feature' | 'fix'
export interface ChangelogEntry {
  id: string; apiId: string; apiName: string
  version: string; date: string; type: ChangelogType
  title: string; description: string
}
```

## Files

- Create: `src/apis/*/changelog.json` (×3), `changelog-store.ts` (+test),
  `features/changelog/{hooks/use-changelog.ts, components/ChangelogPage,
  ChangelogEntryCard, ChangelogFilters, ChangelogPage.test}`, `routes/changelog.tsx`.
- Modify: `api-registry.ts` (`changelog?` field + imports + `asChangelog`),
  `types.ts`, `repositories.ts` (`ChangelogRepository`), `data-source.ts`
  (`changelog` on `DataSource`), `local-json/index.ts` (wire store), `query-keys.ts`
  (`changelog` namespace), `conventions.ts` (`changelogTypeColor`), `router.tsx`,
  `Sidebar.tsx` (nav link).

## Why revised

User asked to fetch one API's changelog at a time (like the Sandbox), not aggregate
all APIs — see plan-v11.
