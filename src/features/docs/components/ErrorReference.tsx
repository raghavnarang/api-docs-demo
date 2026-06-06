import { useErrorReference } from '../hooks/use-catalog'
import { QueryBoundary } from '../../../components/QueryBoundary'
import { StatusBadge } from '../../../components/StatusBadge'

/**
 * Error reference catalogue for an API (§2.2): HTTP and app-level error codes
 * with description, cause, and resolution steps. Loaded from the registry via
 * the DAL `getErrorReference` — not hardcoded.
 */
export function ErrorReference({ apiId }: { apiId: string }) {
  const errors = useErrorReference(apiId)

  // No catalogue for this API → omit the section entirely.
  if (errors.isSuccess && errors.data.length === 0) return null

  return (
    <section
      id="error-reference"
      className="scroll-mt-20 border-t border-slate-200 py-8"
    >
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Error Reference
      </h2>
      <QueryBoundary query={errors}>
        {(entries) => (
          <ul className="space-y-3">
            {entries.map((err) => (
              <li
                key={err.code}
                className="rounded-md border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {err.httpStatus ? (
                    <StatusBadge status={err.httpStatus} />
                  ) : null}
                  <code className="font-mono text-sm font-semibold text-slate-800">
                    {err.code}
                  </code>
                  <span className="text-sm text-slate-600">— {err.title}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{err.description}</p>
                {err.resolution ? (
                  <p className="mt-2 text-sm text-slate-500">
                    <span className="font-medium text-slate-700">
                      Resolution:{' '}
                    </span>
                    {err.resolution}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>
    </section>
  )
}
