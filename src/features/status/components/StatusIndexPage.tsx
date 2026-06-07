import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { EmptyState } from '../../../components/EmptyState'
import { QueryBoundary } from '../../../components/QueryBoundary'
import { SkeletonLines } from '../../../components/Skeleton'
import { useApis } from '../../docs/hooks/use-catalog'

/**
 * Status index (§2.6): lists every registered API, each linking to its dedicated
 * status page. The list comes from the catalogue; per-API health/uptime is
 * fetched on the dedicated page itself (not here), so the index stays a cheap,
 * single catalogue query.
 */
export function StatusIndexPage() {
  const apisQuery = useApis()

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">API Status</h1>
        <p className="mt-1 text-sm text-slate-500">
          Select an API to view its health, 90-day uptime, and incident history.
        </p>
      </div>

      <div className="mt-6">
        <QueryBoundary
          query={apisQuery}
          skeleton={<SkeletonLines lines={4} />}
          empty={<EmptyState title="No APIs registered" />}
        >
          {(apis) => (
            <div className="space-y-2">
              {apis.map((api) => (
                <Link
                  key={api.id}
                  to="/status/$apiId"
                  params={{ apiId: api.id }}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {api.name}
                    </p>
                    {api.description ? (
                      <p className="truncate text-xs text-slate-500">
                        {api.description}
                      </p>
                    ) : null}
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-slate-400"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          )}
        </QueryBoundary>
      </div>
    </div>
  )
}
