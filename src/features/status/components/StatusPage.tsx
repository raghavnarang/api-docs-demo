import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { EmptyState } from '../../../components/EmptyState'
import { QueryBoundary } from '../../../components/QueryBoundary'
import { SkeletonLines } from '../../../components/Skeleton'
import { useApiStatus } from '../hooks/use-status'
import { ApiStatusCard } from './ApiStatusCard'

/**
 * Dedicated status page for a single API (§2.6): health indicator, 90-day uptime
 * bar, and incident history. Data comes from `useApiStatus`, unaware of the
 * backing data source. Loading / error / empty (unknown API) handled by
 * `QueryBoundary`.
 */
export function StatusPage({ apiId }: { apiId: string }) {
  const statusQuery = useApiStatus(apiId)

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        to="/status"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All APIs
      </Link>

      <div className="mt-4">
        <QueryBoundary
          query={statusQuery}
          skeleton={<SkeletonLines lines={6} />}
          empty={
            <EmptyState
              title="Unknown API"
              message="No status is available for this API."
            />
          }
        >
          {(status) => <ApiStatusCard status={status} />}
        </QueryBoundary>
      </div>
    </div>
  )
}
