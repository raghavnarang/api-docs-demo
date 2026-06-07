import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'

type Orientation = 'horizontal' | 'vertical'

const labelClasses: Record<Orientation, string> = {
  horizontal: 'flex items-center gap-2 text-sm text-slate-600',
  vertical: 'flex w-full flex-col gap-1 text-sm',
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Optional label; omit to render a bare styled `<select>`. */
  label?: string
  /** `vertical` (default) stacks label above; `horizontal` sits beside. */
  orientation?: Orientation
  children: ReactNode
}

/**
 * Shared labelled `<select>` primitive — the dropdown counterpart to `Input`.
 * Owns the border/focus styling so the native select looks consistent across
 * the catalogue picker, sandbox, key form, and analytics filter.
 */
export function Select({
  label,
  orientation = 'vertical',
  id,
  className = '',
  children,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  const select = (
    <select
      {...props}
      id={selectId}
      className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
    >
      {children}
    </select>
  )

  if (!label) return select

  return (
    <label htmlFor={selectId} className={labelClasses[orientation]}>
      <span className="font-medium text-slate-700">{label}</span>
      {select}
    </label>
  )
}
