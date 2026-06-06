import { useApi } from '../hooks/use-catalog'
import { QueryBoundary } from '../../../components/QueryBoundary'

/**
 * SDK / library links for an API, loaded from the registry config (never
 * hardcoded in JSX). Each entry shows the language, its install command, and a
 * link to the source repository.
 */
export function SdkLinks({ apiId }: { apiId: string }) {
  const api = useApi(apiId)

  // No SDKs configured for this API → omit the section entirely.
  if (api.isSuccess && (!api.data || api.data.sdks.length === 0)) return null

  return (
    <section id="sdks" className="scroll-mt-20 border-t border-slate-200 py-8">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        SDKs &amp; Libraries
      </h2>
      <QueryBoundary
        query={api}
        isEmpty={(detail) => !detail || detail.sdks.length === 0}
      >
        {(detail) => (
          <ul className="grid gap-3 sm:grid-cols-2">
            {detail.sdks.map((sdk) => (
              <li
                key={`${sdk.lang}-${sdk.repo}`}
                className="rounded-lg border border-slate-200 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {sdk.lang}
                </p>
                <code className="mt-2 block overflow-x-auto rounded bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100">
                  {sdk.install}
                </code>
                <a
                  href={sdk.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline"
                >
                  View repository →
                </a>
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>
    </section>
  )
}
