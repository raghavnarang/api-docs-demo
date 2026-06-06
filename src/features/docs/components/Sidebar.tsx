import { useMemo } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useApis, useApiEndpoints } from '../hooks/use-catalog'
import { useDocsUiStore } from '../store'
import { groupEndpoints } from '../lib/group-endpoints'
import { MethodBadge } from '../../../components/MethodBadge'

/**
 * Persistent navigation: lists every registered API and, for the active one,
 * a table-of-contents of its endpoints (grouped by resource) with hash links.
 * The active endpoint comes from the docs store (set by the page's scroll-spy).
 */
export function Sidebar() {
  const apis = useApis()
  const params = useParams({ strict: false }) as { apiId?: string }
  const activeApiId = params.apiId

  const endpointsQuery = useApiEndpoints(activeApiId ?? '')
  const endpoints = useMemo(
    () => endpointsQuery.data ?? [],
    [endpointsQuery.data],
  )
  const groups = useMemo(() => groupEndpoints(endpoints), [endpoints])
  const activeEndpointId = useDocsUiStore((s) => s.activeEndpointId)

  return (
    <nav
      className="flex h-full flex-col overflow-y-auto px-3 py-4"
      aria-label="API navigation"
    >
      <Link
        to="/docs"
        className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400"
      >
        API Catalogue
      </Link>

      <ul className="mt-4 space-y-1">
        {(apis.data ?? []).map((api) => {
          const isActive = api.id === activeApiId
          return (
            <li key={api.id}>
              <Link
                to="/docs/$apiId"
                params={{ apiId: api.id }}
                className={`block rounded px-2 py-1.5 text-sm font-medium ${
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {api.name}
              </Link>

              {isActive && groups.length > 0 ? (
                <div className="mt-1 space-y-3 border-l border-slate-200 pl-2">
                  {groups.map((group) => (
                    <div key={group.resource}>
                      <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {group.resource}
                      </p>
                      <ul>
                        {group.endpoints.map((ep) => (
                          <li key={ep.id}>
                            <Link
                              to="/docs/$apiId"
                              params={{ apiId: api.id }}
                              hash={ep.id}
                              className={`flex items-center gap-2 rounded px-2 py-1 text-xs ${
                                ep.id === activeEndpointId
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <MethodBadge method={ep.method} />
                              <span className="truncate">
                                {ep.summary ?? ep.path}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
