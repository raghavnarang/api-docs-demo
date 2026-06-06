import { methodColor } from './http/conventions'

/** Coloured HTTP method pill (GET/POST/…) using the shared colour convention. */
export function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={`inline-flex min-w-14 justify-center rounded px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide ${methodColor(method)}`}
    >
      {method}
    </span>
  )
}
