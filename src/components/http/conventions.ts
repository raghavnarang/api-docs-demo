/**
 * Single source of truth for the HTTP colour convention (§ "consistent visual
 * language"). Returns Tailwind utility classes for a pill/badge so method and
 * status colours stay consistent everywhere they appear (docs now, sandbox later).
 */

type BadgeClasses = string

const PALETTE = {
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
  green: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20',
} as const

/** GET = blue, POST = green, PUT/PATCH = amber, DELETE = red, else slate. */
export function methodColor(method: string): BadgeClasses {
  switch (method.toLowerCase()) {
    case 'get':
      return PALETTE.blue
    case 'post':
      return PALETTE.green
    case 'put':
    case 'patch':
      return PALETTE.amber
    case 'delete':
      return PALETTE.red
    default:
      return PALETTE.slate
  }
}

/** 2xx = green, 3xx = blue, 4xx = amber, 5xx = red, non-numeric/other = slate. */
export function statusColor(status: string | number): BadgeClasses {
  const code = typeof status === 'number' ? status : Number.parseInt(status, 10)
  if (Number.isNaN(code)) return PALETTE.slate
  if (code >= 200 && code < 300) return PALETTE.green
  if (code >= 300 && code < 400) return PALETTE.blue
  if (code >= 400 && code < 500) return PALETTE.amber
  if (code >= 500) return PALETTE.red
  return PALETTE.slate
}
