import { Badge } from './Badge'
import { methodColor } from './http/conventions'

/** Coloured HTTP method pill (GET/POST/…) using the shared colour convention. */
export function MethodBadge({ method }: { method: string }) {
  return (
    <Badge
      mono
      tone={methodColor(method)}
      className="min-w-14 uppercase tracking-wide"
    >
      {method}
    </Badge>
  )
}
