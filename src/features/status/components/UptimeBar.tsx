import type { UptimeDay } from '../../../lib/data/types'

/** Tailwind fill for one uptime cell: green ≥99.5%, amber ≥90%, else red. */
function cellColor(uptime: number): string {
  if (uptime >= 0.995) return 'bg-green-500'
  if (uptime >= 0.9) return 'bg-amber-400'
  return 'bg-red-500'
}

/**
 * statuspage.io-style 90-day uptime bar (§2.6): one cell per day (oldest → newest)
 * coloured by that day's uptime, with the headline 90-day uptime percentage.
 */
export function UptimeBar({
  days,
  uptime90d,
}: {
  days: UptimeDay[]
  uptime90d: number
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{days.length}-day uptime</span>
        <span className="font-semibold text-slate-700">
          {(uptime90d * 100).toFixed(2)}%
        </span>
      </div>
      <div className="mt-1.5 flex gap-0.5" aria-hidden>
        {days.map((d) => (
          <span
            key={d.date}
            title={`${d.date}: ${(d.uptime * 100).toFixed(1)}%`}
            className={`h-7 flex-1 rounded-sm ${cellColor(d.uptime)}`}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{days[0]?.date}</span>
        <span>Today</span>
      </div>
    </div>
  )
}
