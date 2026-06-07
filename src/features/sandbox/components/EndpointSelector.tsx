import { Select } from '../../../components/Select'
import { useApis, useApiEndpoints } from '../../docs/hooks/use-catalog'

/**
 * API + endpoint dropdowns. Reads the same cached `useApis` / `useApiEndpoints`
 * queries the docs use (no extra parse). Selection is lifted to the route search
 * params by the parent so the URL stays shareable.
 */
export function EndpointSelector({
  apiId,
  endpointId,
  onApiChange,
  onEndpointChange,
}: {
  apiId?: string
  endpointId?: string
  onApiChange: (apiId: string) => void
  onEndpointChange: (endpointId: string) => void
}) {
  const apis = useApis()
  const endpoints = useApiEndpoints(apiId ?? '')

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        label="API"
        value={apiId ?? ''}
        onChange={(e) => onApiChange(e.target.value)}
      >
        <option value="" disabled>
          Select an API…
        </option>
        {(apis.data ?? []).map((api) => (
          <option key={api.id} value={api.id}>
            {api.name}
          </option>
        ))}
      </Select>

      <Select
        label="Endpoint"
        value={endpointId ?? ''}
        onChange={(e) => onEndpointChange(e.target.value)}
        disabled={!apiId || endpoints.isPending}
        className="font-mono"
      >
        <option value="" disabled>
          {apiId ? 'Select an endpoint…' : 'Select an API first'}
        </option>
        {(endpoints.data ?? []).map((endpoint) => (
          <option key={endpoint.id} value={endpoint.id}>
            {endpoint.method.toUpperCase()} {endpoint.path}
          </option>
        ))}
      </Select>
    </div>
  )
}
