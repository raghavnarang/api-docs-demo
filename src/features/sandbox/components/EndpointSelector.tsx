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
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">API</span>
        <select
          value={apiId ?? ''}
          onChange={(e) => onApiChange(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="" disabled>
            Select an API…
          </option>
          {(apis.data ?? []).map((api) => (
            <option key={api.id} value={api.id}>
              {api.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Endpoint</span>
        <select
          value={endpointId ?? ''}
          onChange={(e) => onEndpointChange(e.target.value)}
          disabled={!apiId || endpoints.isPending}
          className="rounded-md border border-slate-300 px-2 py-2 font-mono text-xs disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="" disabled>
            {apiId ? 'Select an endpoint…' : 'Select an API first'}
          </option>
          {(endpoints.data ?? []).map((endpoint) => (
            <option key={endpoint.id} value={endpoint.id}>
              {endpoint.method.toUpperCase()} {endpoint.path}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
