import { statusColor } from './http/conventions'

/**
 * Coloured HTTP status pill. Accepts numeric codes or spec keys like `default`
 * (rendered slate). Used for response status codes throughout docs + sandbox.
 */
export function StatusBadge({ status }: { status: string | number }) {
  return (
    <span
      className={`inline-flex justify-center rounded px-2 py-0.5 font-mono text-xs font-semibold ${statusColor(status)}`}
    >
      {status}
    </span>
  )
}
