import { lazy, Suspense } from 'react'
import type { UsageTimePoint } from '../../../lib/data/types'
import { Skeleton } from '../../../components/Skeleton'

// Recharts is heavy; keep it in its own chunk loaded only when the dashboard
// renders (mirrors the sandbox BodyEditor lazy pattern).
const UsageChartImpl = lazy(() => import('./UsageChartImpl'))

/** Time-series chart of calls vs errors, code-split from the main bundle. */
export function UsageChart({ series }: { series: UsageTimePoint[] }) {
  return (
    <Suspense fallback={<Skeleton className="h-72 w-full" />}>
      <UsageChartImpl series={series} />
    </Suspense>
  )
}
