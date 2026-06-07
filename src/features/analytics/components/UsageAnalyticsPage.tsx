import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { BarChart3 } from 'lucide-react'
import { EmptyState } from '../../../components/EmptyState'
import { ErrorState } from '../../../components/ErrorState'
import { QueryBoundary } from '../../../components/QueryBoundary'
import { SkeletonLines } from '../../../components/Skeleton'
import type { UsageWindow } from '../../../lib/data/types'
import { useApiKeys } from '../../keys/hooks/use-api-keys'
import { useKeyUsage } from '../hooks/use-analytics'
import { MetricCards } from './MetricCards'
import { UsageChart } from './UsageChart'
import { EndpointBreakdownTable } from './EndpointBreakdownTable'

const WINDOWS: { value: UsageWindow; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
]

function WindowToggle({
  value,
  onChange,
}: {
  value: UsageWindow
  onChange: (window: UsageWindow) => void
}) {
  return (
    <div
      className="inline-flex rounded-md border border-slate-300 p-0.5"
      role="group"
      aria-label="Reporting window"
    >
      {WINDOWS.map((w) => (
        <button
          key={w.value}
          type="button"
          onClick={() => onChange(w.value)}
          aria-pressed={value === w.value}
          className={`rounded px-3 py-1 text-sm font-medium ${
            value === w.value
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {w.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Usage Analytics Dashboard (§2.5). Per-key metrics over a 7- or 30-day window:
 * headline cards, a calls/errors time-series chart, and a per-endpoint table.
 * Data comes from `useKeyUsage`, unaware of the backing data source. Handles
 * loading, empty (no keys), and error states explicitly.
 */
export function UsageAnalyticsPage() {
  const keysQuery = useApiKeys()
  const [selectedKeyId, setSelectedKeyId] = useState('')
  const [window, setWindow] = useState<UsageWindow>('7d')

  const keys = keysQuery.data ?? []
  // Keep the selection if still valid, else fall back to the first key.
  const activeKeyId = keys.some((k) => k.id === selectedKeyId)
    ? selectedKeyId
    : (keys[0]?.id ?? '')

  const usageQuery = useKeyUsage(activeKeyId, window)

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Usage Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Call volume, error rate, and latency per API key.
        </p>
      </div>

      <div className="mt-6">
        {keysQuery.isLoading ? (
          <SkeletonLines lines={4} />
        ) : keysQuery.isError ? (
          <ErrorState
            title="Could not load keys"
            error={keysQuery.error}
            onRetry={() => keysQuery.refetch()}
          />
        ) : keys.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="h-7 w-7" aria-hidden />}
            title="No API keys yet"
            message={
              <>
                Create a key on the{' '}
                <Link to="/keys" className="font-medium text-blue-600">
                  API Keys
                </Link>{' '}
                page to see its usage analytics.
              </>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-medium">Key</span>
                <select
                  value={activeKeyId}
                  onChange={(e) => setSelectedKeyId(e.target.value)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {keys.map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.name} ({key.environment})
                    </option>
                  ))}
                </select>
              </label>
              <WindowToggle value={window} onChange={setWindow} />
            </div>

            <div className="mt-6">
              <QueryBoundary query={usageQuery} skeleton={<SkeletonLines lines={6} />}>
                {(report) => (
                  <div className="space-y-6">
                    <MetricCards summary={report.summary} />
                    <UsageChart series={report.series} />
                    <EndpointBreakdownTable endpoints={report.endpoints} />
                  </div>
                )}
              </QueryBoundary>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
