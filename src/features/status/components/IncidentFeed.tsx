import type { StatusIncident } from '../../../lib/data/types'

/** Recent days the feed renders, newest first (kept in sync with the store). */
const FEED_DAYS = 14

/** ISO `YYYY-MM-DD` for `daysAgo` days before `today`. */
function isoDay(today: Date, daysAgo: number): string {
  const d = new Date(today)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

/** Day header, e.g. "May 28, 2026". */
function formatDay(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** Update timestamp, e.g. "May 29, 01:00 UTC". */
function formatTs(iso: string): string {
  const d = new Date(iso)
  const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
  const day = d.getUTCDate()
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${month} ${day}, ${hh}:${mm} UTC`
}

/** Incident title colour by severity. */
function titleColor(impact: StatusIncident['impact']): string {
  return impact === 'outage' ? 'text-red-600' : 'text-amber-600'
}

function IncidentBlock({ incident }: { incident: StatusIncident }) {
  return (
    <div>
      <h4 className={`text-base font-semibold ${titleColor(incident.impact)}`}>
        {incident.title}
      </h4>
      <ul className="mt-2 space-y-3">
        {incident.updates.map((u, i) => (
          <li key={`${incident.id}-${i}`}>
            <p className="text-sm text-slate-800">
              <span className="font-semibold">{u.status}</span> - {u.body}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {formatTs(u.timestamp)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Incident history feed (§2.6), grouped day-by-day over the recent window
 * (newest first). Each day lists the incidents that started that day with their
 * update timeline; days with nothing show "No incidents reported."
 */
export function IncidentFeed({ incidents }: { incidents: StatusIncident[] }) {
  const today = new Date()
  const days = Array.from({ length: FEED_DAYS }, (_, i) => isoDay(today, i))

  const byDay = new Map<string, StatusIncident[]>()
  for (const inc of incidents) {
    const key = inc.startedAt.slice(0, 10)
    const list = byDay.get(key)
    if (list) list.push(inc)
    else byDay.set(key, [inc])
  }

  return (
    <div className="space-y-8">
      {days.map((date) => {
        const dayIncidents = byDay.get(date) ?? []
        return (
          <div key={date}>
            <h3 className="border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">
              {formatDay(date)}
            </h3>
            <div className="mt-3">
              {dayIncidents.length === 0 ? (
                <p className="text-sm text-slate-400">No incidents reported.</p>
              ) : (
                <div className="space-y-6">
                  {dayIncidents.map((inc) => (
                    <IncidentBlock key={inc.id} incident={inc} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
