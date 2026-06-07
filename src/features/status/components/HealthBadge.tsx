import { Badge } from '../../../components/Badge'
import { healthColor } from '../../../components/http/conventions'
import type { ApiHealth } from '../../../lib/data/types'

const LABEL: Record<ApiHealth, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
}

/** Coloured per-API health pill (§2.6) using the shared colour convention. */
export function HealthBadge({ health }: { health: ApiHealth }) {
  return (
    <Badge shape="pill" tone={healthColor(health)} className="gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {LABEL[health]}
    </Badge>
  )
}
