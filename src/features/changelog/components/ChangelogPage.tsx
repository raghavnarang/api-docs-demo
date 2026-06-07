import { useState } from 'react'
import { ScrollText } from 'lucide-react'
import { EmptyState } from '../../../components/EmptyState'
import { ErrorState } from '../../../components/ErrorState'
import { QueryBoundary } from '../../../components/QueryBoundary'
import { SkeletonLines } from '../../../components/Skeleton'
import { useApis } from '../../docs/hooks/use-catalog'
import { changelogRoute } from '../../../routes/changelog'
import { useApiChangelog } from '../hooks/use-changelog'
import { ChangelogApiPicker } from './ChangelogApiPicker'
import { ChangelogEntryCard } from './ChangelogEntryCard'
import {
  ChangelogTypeFilter,
  type ChangelogTypeFilterValue,
} from './ChangelogTypeFilter'

/**
 * Changelog (§2.7). Fetches one API's versioned entries at a time — the API is
 * selected via a picker and persisted in the `?api` search param (shareable /
 * deep-linkable, same pattern as the Sandbox). A type filter narrows the loaded
 * list client-side. Loading / empty / error are handled by `QueryBoundary`.
 */
export function ChangelogPage() {
  const search = changelogRoute.useSearch()
  const navigate = changelogRoute.useNavigate()
  const apisQuery = useApis()
  const [typeFilter, setTypeFilter] =
    useState<ChangelogTypeFilterValue>('all')

  const apis = apisQuery.data ?? []
  // Keep the URL selection if it's still a registered API, else fall back to the
  // first — so the page always has a valid API once the catalogue loads.
  const activeApiId = apis.some((a) => a.id === search.api)
    ? (search.api as string)
    : (apis[0]?.id ?? '')

  const changelogQuery = useApiChangelog(activeApiId)
  const entries = changelogQuery.data ?? []
  const filtered =
    typeFilter === 'all'
      ? entries
      : entries.filter((e) => e.type === typeFilter)

  const selectApi = (apiId: string) =>
    void navigate({ search: { api: apiId } })

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Changelog</h1>
        <p className="mt-1 text-sm text-slate-500">
          Versioned updates per API — breaking changes, features, and fixes.
        </p>
      </div>

      <div className="mt-6">
        {apisQuery.isLoading ? (
          <SkeletonLines lines={4} />
        ) : apisQuery.isError ? (
          <ErrorState
            title="Could not load APIs"
            error={apisQuery.error}
            onRetry={() => apisQuery.refetch()}
          />
        ) : apis.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="h-7 w-7" aria-hidden />}
            title="No APIs registered"
            message="Add an API to the registry to see its changelog."
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ChangelogApiPicker
                apis={apis}
                value={activeApiId}
                onChange={selectApi}
              />
              <ChangelogTypeFilter
                value={typeFilter}
                onChange={setTypeFilter}
              />
            </div>

            <div className="mt-6">
              <QueryBoundary
                query={changelogQuery}
                skeleton={<SkeletonLines lines={6} />}
                empty={
                  <EmptyState
                    icon={<ScrollText className="h-7 w-7" aria-hidden />}
                    title="No changelog entries"
                    message="This API has no published changelog yet."
                  />
                }
              >
                {() =>
                  filtered.length === 0 ? (
                    <EmptyState
                      title={`No ${typeFilter} entries`}
                      message="Try a different filter."
                    />
                  ) : (
                    <div className="space-y-3">
                      {filtered.map((entry) => (
                        <ChangelogEntryCard key={entry.id} entry={entry} />
                      ))}
                    </div>
                  )
                }
              </QueryBoundary>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
