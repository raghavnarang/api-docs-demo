import type { ApiSummary } from '../../../lib/data/types'

/**
 * Single-level API selector for the Changelog page — same native `<select>`
 * pattern as the Sandbox's `EndpointSelector`. Selection is owned by the page
 * (lifted to the `?api` search param), so this is a controlled component.
 */
export function ChangelogApiPicker({
  apis,
  value,
  onChange,
}: {
  apis: ApiSummary[]
  value: string
  onChange: (apiId: string) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <span className="font-medium">API</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <option value="" disabled>
          Select an API…
        </option>
        {apis.map((api) => (
          <option key={api.id} value={api.id}>
            {api.name}
          </option>
        ))}
      </select>
    </label>
  )
}
