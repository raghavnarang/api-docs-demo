import { Badge } from './Badge'
import { statusColor } from './http/conventions'

/**
 * Coloured HTTP status pill. Accepts numeric codes or spec keys like `default`
 * (rendered slate). Used for response status codes throughout docs + sandbox.
 */
export function StatusBadge({ status }: { status: string | number }) {
  return (
    <Badge mono tone={statusColor(status)}>
      {status}
    </Badge>
  )
}
