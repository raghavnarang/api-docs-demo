import type { ApiStatus } from '../../../lib/data/types'
import { HealthBadge } from './HealthBadge'
import { UptimeBar } from './UptimeBar'
import { IncidentFeed } from './IncidentFeed'

/** One API's status panel (§2.6): health, 90-day uptime bar, and incident feed. */
export function ApiStatusCard({ status }: { status: ApiStatus }) {
  return (
    <section className="rounded-lg border border-slate-200 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">
          {status.apiName}
        </h2>
        <HealthBadge health={status.health} />
      </div>

      <div className="mt-4">
        <UptimeBar days={status.days} uptime90d={status.uptime90d} />
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Incident history
        </p>
        <div className="mt-2">
          <IncidentFeed incidents={status.incidents} />
        </div>
      </div>
    </section>
  )
}
