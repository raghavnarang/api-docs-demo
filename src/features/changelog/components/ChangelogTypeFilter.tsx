import type { ChangelogType } from '../../../lib/data/types'

/** `'all'` plus each entry type — drives the segmented filter. */
export type ChangelogTypeFilterValue = ChangelogType | 'all'

const OPTIONS: { value: ChangelogTypeFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'breaking', label: 'Breaking' },
  { value: 'feature', label: 'Feature' },
  { value: 'fix', label: 'Fix' },
]

/**
 * Segmented control to filter the loaded changelog by type (§2.7). Same markup
 * as the analytics window toggle: client-side only, no refetch.
 */
export function ChangelogTypeFilter({
  value,
  onChange,
}: {
  value: ChangelogTypeFilterValue
  onChange: (value: ChangelogTypeFilterValue) => void
}) {
  return (
    <div
      className="inline-flex rounded-md border border-slate-300 p-0.5"
      role="group"
      aria-label="Filter by entry type"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`rounded px-3 py-1 text-sm font-medium ${
            value === opt.value
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
