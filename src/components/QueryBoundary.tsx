import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { SkeletonLines } from './Skeleton'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'

/** Default emptiness check: null/undefined, or an empty array. */
function defaultIsEmpty(data: unknown): boolean {
  return data == null || (Array.isArray(data) && data.length === 0)
}

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T>
  /** Override the emptiness check (e.g. for objects). */
  isEmpty?: (data: T) => boolean
  /** Custom loading / empty slots; sensible defaults otherwise. */
  skeleton?: ReactNode
  empty?: ReactNode
  /** Only runs with present, non-empty data (loading/error/empty handled above). */
  children: (data: NonNullable<T>) => ReactNode
}

/**
 * Standardizes the three required states (loading / error / empty) for any
 * TanStack Query result, so every data-dependent view gets them for free and
 * `children` only ever runs with present, non-empty data.
 */
export function QueryBoundary<T>({
  query,
  isEmpty = defaultIsEmpty,
  skeleton,
  empty,
  children,
}: QueryBoundaryProps<T>) {
  if (query.isPending) return <>{skeleton ?? <SkeletonLines />}</>
  if (query.isError)
    return (
      <ErrorState error={query.error} onRetry={() => void query.refetch()} />
    )
  if (isEmpty(query.data)) return <>{empty ?? <EmptyState />}</>
  return <>{children(query.data as NonNullable<T>)}</>
}
