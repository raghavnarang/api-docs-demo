import { Link } from '@tanstack/react-router'
import { useApis } from '../hooks/use-catalog'
import { QueryBoundary } from '../../../components/QueryBoundary'
import { EmptyState } from '../../../components/EmptyState'

/** Landing grid of registered APIs — cards link into each API's docs page. */
export function CatalogueGrid() {
  const apis = useApis()

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">API Catalogue</h1>
      <p className="mt-1 text-slate-500">
        Browse documentation for every registered API.
      </p>

      <div className="mt-6">
        <QueryBoundary
          query={apis}
          empty={
            <EmptyState
              title="No APIs registered"
              message="Add an entry to src/apis/api-registry.ts to get started."
            />
          }
        >
          {(list) => (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((api) => (
                <li key={api.id}>
                  <Link
                    to="/docs/$apiId"
                    params={{ apiId: api.id }}
                    className="block h-full rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-slate-900">
                        {api.name}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        v{api.version}
                      </span>
                    </div>
                    {api.description ? (
                      <p className="mt-1 line-clamp-3 text-sm text-slate-600">
                        {api.description}
                      </p>
                    ) : null}
                    <p className="mt-3 truncate font-mono text-xs text-slate-400">
                      {api.baseUrl}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </QueryBoundary>
      </div>
    </div>
  )
}
