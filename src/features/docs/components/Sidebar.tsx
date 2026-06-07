import { useMemo } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { BarChart3, KeyRound, TerminalSquare } from 'lucide-react'
import {
  useApi,
  useApiDocs,
  useApiEndpoints,
  useApis,
  useErrorReference,
} from '../hooks/use-catalog'
import { useDocsUiStore } from '../store'
import { groupEndpoints } from '../lib/group-endpoints'
import { MethodBadge } from '../../../components/MethodBadge'

/** Top-level TOC link to a non-endpoint page section (Getting Started, Errors, SDKs). */
function SectionLink({
  apiId,
  hash,
  children,
}: {
  apiId: string
  hash: string
  children: React.ReactNode
}) {
  return (
    <Link
      to="/docs/$apiId"
      params={{ apiId }}
      hash={hash}
      className="block rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
    >
      {children}
    </Link>
  )
}

/**
 * Persistent navigation: lists every registered API and, for the active one,
 * a table-of-contents — Getting Started, endpoints grouped by resource, Error
 * Reference, and SDKs — with hash links. The active endpoint comes from the docs
 * store (set by the page's scroll-spy).
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

  // Only surface a section's TOC link when that API actually has the content
  // (cached — the docs page reads the same queries). A minimal API with just an
  // openapi.json shows no Getting Started / Errors / SDK links.
  const docs = useApiDocs(activeApiId ?? '')
  const detail = useApi(activeApiId ?? '')
  const errors = useErrorReference(activeApiId ?? '')
  const hasDocs = Boolean(docs.data)
  const hasErrors = (errors.data?.length ?? 0) > 0
  const hasSdks = (detail.data?.sdks?.length ?? 0) > 0

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

              {isActive ? (
                <div className="mt-1 space-y-3 border-l border-slate-200 pl-2">
                  {hasDocs ? (
                    <SectionLink apiId={api.id} hash="getting-started">
                      Getting Started
                    </SectionLink>
                  ) : null}

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

                  {hasErrors ? (
                    <SectionLink apiId={api.id} hash="error-reference">
                      Error Reference
                    </SectionLink>
                  ) : null}
                  {hasSdks ? (
                    <SectionLink apiId={api.id} hash="sdks">
                      SDKs &amp; Libraries
                    </SectionLink>
                  ) : null}
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Portal
        </p>
        <ul className="mt-2 space-y-1">
          <li>
            <Link
              to="/keys"
              className="flex items-center gap-2 rounded px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              activeProps={{ className: 'bg-slate-100 text-slate-900' }}
            >
              <KeyRound className="h-4 w-4" aria-hidden />
              API Keys
            </Link>
          </li>
          <li>
            <Link
              to="/sandbox"
              className="flex items-center gap-2 rounded px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              activeProps={{ className: 'bg-slate-100 text-slate-900' }}
            >
              <TerminalSquare className="h-4 w-4" aria-hidden />
              Sandbox
            </Link>
          </li>
          <li>
            <Link
              to="/analytics"
              className="flex items-center gap-2 rounded px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              activeProps={{ className: 'bg-slate-100 text-slate-900' }}
            >
              <BarChart3 className="h-4 w-4" aria-hidden />
              Usage Analytics
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
