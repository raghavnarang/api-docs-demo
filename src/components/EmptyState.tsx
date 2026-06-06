import type { ReactNode } from 'react'

/** Neutral placeholder when a successful query returns nothing to show. */
export function EmptyState({
  title = 'Nothing here yet',
  message,
  icon = '◌',
}: {
  title?: string
  message?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-6 py-12 text-center">
      <span className="text-2xl text-slate-400" aria-hidden>
        {icon}
      </span>
      <p className="font-medium text-slate-700">{title}</p>
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    </div>
  )
}
