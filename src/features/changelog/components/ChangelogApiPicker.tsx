import { Select } from '../../../components/Select'
import type { ApiSummary } from '../../../lib/data/types'

/**
 * Single-level API selector for the Changelog page — uses the shared `Select`
 * primitive (same as the Sandbox's `EndpointSelector`). Selection is owned by
 * the page (lifted to the `?api` search param), so this is a controlled component.
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
    <Select
      label="API"
      orientation="horizontal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Select an API…
      </option>
      {apis.map((api) => (
        <option key={api.id} value={api.id}>
          {api.name}
        </option>
      ))}
    </Select>
  )
}
