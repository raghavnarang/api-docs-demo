import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { UsageTimePoint } from '../../../lib/data/types'

/** Format an ISO `YYYY-MM-DD` as a short `MMM D` axis tick. */
function shortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Recharts time-series of calls vs errors over the window. Loaded lazily (see
 * `UsageChart`) so Recharts stays out of the main bundle.
 */
export default function UsageChartImpl({
  series,
}: {
  series: UsageTimePoint[]
}) {
  return (
    <div className="h-72 w-full rounded-lg border border-slate-200 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={series}
          margin={{ top: 8, right: 16, bottom: 0, left: -8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tick={{ fontSize: 12, fill: '#64748b' }}
            minTickGap={24}
          />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} width={48} />
          <Tooltip
            labelFormatter={(label) => shortDate(String(label))}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="calls"
            name="Calls"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="errors"
            name="Errors"
            stroke="#dc2626"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
