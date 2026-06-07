import { changelogTypeColor } from '../../../components/http/conventions'
import type { ChangelogEntry } from '../../../lib/data/types'

const TYPE_LABELS: Record<ChangelogEntry['type'], string> = {
  breaking: 'Breaking',
  feature: 'Feature',
  fix: 'Fix',
}

/** Format an ISO date (YYYY-MM-DD) as e.g. "12 Nov 2024" in a stable locale. */
function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** One changelog entry: type badge, version, date, title, description. */
export function ChangelogEntryCard({ entry }: { entry: ChangelogEntry }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${changelogTypeColor(
            entry.type,
          )}`}
        >
          {TYPE_LABELS[entry.type]}
        </span>
        <span className="font-mono text-xs text-slate-500">
          v{entry.version}
        </span>
        <time
          dateTime={entry.date}
          className="ml-auto text-xs text-slate-400"
        >
          {formatDate(entry.date)}
        </time>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-slate-900">
        {entry.title}
      </h3>
      <p className="mt-1 text-sm text-slate-600">{entry.description}</p>
    </article>
  )
}
