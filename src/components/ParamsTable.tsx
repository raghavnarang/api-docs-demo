import type { EndpointParam } from '../lib/spec-parser'

/**
 * Renders endpoint parameters as a name / type / required / description table,
 * grouped by location (path → query → header → cookie). Pure presentation —
 * data comes pre-parsed from `parseOpenApiSpec`.
 */

const GROUP_ORDER: EndpointParam['in'][] = ['path', 'query', 'header', 'cookie']
const GROUP_LABEL: Record<EndpointParam['in'], string> = {
  path: 'Path parameters',
  query: 'Query parameters',
  header: 'Header parameters',
  cookie: 'Cookie parameters',
}

export function ParamsTable({ params }: { params: EndpointParam[] }) {
  if (params.length === 0) return null

  return (
    <div className="space-y-4">
      {GROUP_ORDER.map((group) => {
        const rows = params.filter((p) => p.in === group)
        if (rows.length === 0) return null
        return (
          <div key={group}>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {GROUP_LABEL[group]}
            </h4>
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Required</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((p) => (
                    <tr key={`${p.in}-${p.name}`} className="align-top">
                      <td className="px-3 py-2 font-mono text-slate-800">
                        {p.name}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-500">
                        {p.type ?? '—'}
                      </td>
                      <td className="px-3 py-2">
                        {p.required ? (
                          <span className="text-xs font-medium text-red-600">
                            required
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            optional
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {p.description ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
