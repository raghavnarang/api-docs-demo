import { useEffect, useMemo } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Activity, ScrollText } from 'lucide-react'
import { useApi, useApiEndpoints } from '../hooks/use-catalog'
import { DOCS_BOTTOM_SENTINEL_ID, useScrollSpy } from '../hooks/use-scroll-spy'
import { useDocsUiStore } from '../store'
import { QueryBoundary } from '../../../components/QueryBoundary'
import { EmptyState } from '../../../components/EmptyState'
import { EndpointSection } from './EndpointSection'
import { GettingStarted } from './GettingStarted'
import { ErrorReference } from './ErrorReference'
import { SdkLinks } from './SdkLinks'

/**
 * Scroll-per-API documentation page: API header + every endpoint rendered from
 * the OpenAPI spec, stacked and anchored. Hash navigation scrolls the matching
 * endpoint into view once the (cached, parse-once) endpoints have loaded.
 *
 * Owns the scroll-spy (co-located with the sections it observes) and publishes the
 * active endpoint id to the docs store for the sidebar TOC to highlight.
 */
export function ApiDocsPage({ apiId }: { apiId: string }) {
  const api = useApi(apiId)
  const endpointsQuery = useApiEndpoints(apiId)
  const endpoints = useMemo(
    () => endpointsQuery.data ?? [],
    [endpointsQuery.data],
  )

  const setActiveEndpointId = useDocsUiStore((s) => s.setActiveEndpointId)
  useScrollSpy(
    useMemo(() => endpoints.map((e) => e.id), [endpoints]),
    setActiveEndpointId,
  )
  useEffect(() => () => setActiveEndpointId(null), [setActiveEndpointId])

  const { hash } = useLocation()
  useEffect(() => {
    if (!hash || endpoints.length === 0) return
    const el = document.getElementById(hash.replace(/^#/, ''))
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash, endpoints])

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <QueryBoundary query={api} empty={<EmptyState title="API not found" />}>
        {(detail) => (
          <header className="border-b border-slate-200 pb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {detail.name}
                </h1>
                <span className="font-mono text-sm text-slate-400">
                  v{detail.version}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/changelog"
                  search={{ api: apiId }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <ScrollText className="h-3.5 w-3.5" aria-hidden />
                  View changelog
                </Link>
                <Link
                  to="/status/$apiId"
                  params={{ apiId }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Activity className="h-3.5 w-3.5" aria-hidden />
                  View status
                </Link>
              </div>
            </div>
            {detail.description ? (
              <p className="mt-2 text-slate-600">{detail.description}</p>
            ) : null}
            <p className="mt-3 font-mono text-xs text-slate-400">
              {detail.baseUrl}
            </p>
          </header>
        )}
      </QueryBoundary>

      <GettingStarted apiId={apiId} />

      <section id="endpoints" className="scroll-mt-20">
        <h2 className="border-t border-slate-200 pt-8 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Endpoints
        </h2>
        <QueryBoundary
          query={endpointsQuery}
          isEmpty={(list) => list.length === 0}
          empty={<EmptyState title="No endpoints in this spec" />}
        >
          {(list) => (
            <div>
              {list.map((endpoint) => (
                <EndpointSection
                  key={endpoint.id}
                  endpoint={endpoint}
                  apiId={apiId}
                />
              ))}
            </div>
          )}
        </QueryBoundary>
      </section>

      <ErrorReference apiId={apiId} />
      <SdkLinks apiId={apiId} />

      {/* Marker for scroll-spy: lets the last section activate at page bottom. */}
      <div id={DOCS_BOTTOM_SENTINEL_ID} aria-hidden className="h-px" />
    </div>
  )
}
