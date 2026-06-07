import type { UsageSummary } from '../../../lib/data/types'

const numberFmt = new Intl.NumberFormat('en-US')

function Card({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

/** Headline metrics for the selected key + window (§2.5). */
export function MetricCards({ summary }: { summary: UsageSummary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card label="Total calls" value={numberFmt.format(summary.totalCalls)} />
      <Card
        label="Error rate"
        value={`${(summary.errorRate * 100).toFixed(2)}%`}
        hint={`${numberFmt.format(summary.errors4xx)} × 4xx · ${numberFmt.format(
          summary.errors5xx,
        )} × 5xx`}
      />
      <Card label="Avg latency" value={`${summary.avgLatencyMs} ms`} />
    </div>
  )
}
