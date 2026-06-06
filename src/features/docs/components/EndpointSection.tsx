import type { EndpointDef } from '../../../lib/spec-parser'
import { MethodBadge } from '../../../components/MethodBadge'
import { StatusBadge } from '../../../components/StatusBadge'
import { ParamsTable } from '../../../components/ParamsTable'
import { SchemaViewer } from '../../../components/SchemaViewer'

/**
 * Renders one endpoint entirely from its parsed `EndpointDef`: method badge,
 * path, description, params table, request-body schema, and response schemas.
 * The wrapping `<section id>` is the scroll/anchor target for the TOC.
 */
export function EndpointSection({ endpoint }: { endpoint: EndpointDef }) {
  const { method, path, summary, description, params, requestBody, responses } =
    endpoint

  return (
    <section
      id={endpoint.id}
      className="scroll-mt-20 border-t border-slate-200 py-8"
    >
      <div className="flex flex-wrap items-center gap-3">
        <MethodBadge method={method} />
        <code className="font-mono text-sm text-slate-800">{path}</code>
      </div>
      {summary ? (
        <h3 className="mt-2 text-lg font-semibold text-slate-900">{summary}</h3>
      ) : null}
      {description ? (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      ) : null}

      {params.length > 0 ? (
        <div className="mt-5">
          <ParamsTable params={params} />
        </div>
      ) : null}

      {requestBody ? (
        <div className="mt-6">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Request body
            {requestBody.required ? (
              <span className="ml-2 text-red-600">required</span>
            ) : null}
          </h4>
          <p className="mb-2 font-mono text-xs text-slate-400">
            {requestBody.contentTypes.join(', ') || 'application/json'}
          </p>
          {requestBody.schema ? (
            <div className="rounded-md border border-slate-200 p-3">
              <SchemaViewer node={requestBody.schema} />
            </div>
          ) : null}
        </div>
      ) : null}

      {responses.length > 0 ? (
        <div className="mt-6">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Responses
          </h4>
          <div className="space-y-3">
            {responses.map((res) => (
              <div
                key={res.status}
                className="rounded-md border border-slate-200 p-3"
              >
                <div className="flex items-center gap-2">
                  <StatusBadge status={res.status} />
                  {res.description ? (
                    <span className="text-sm text-slate-600">
                      {res.description}
                    </span>
                  ) : null}
                </div>
                {res.schema ? (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <SchemaViewer node={res.schema} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
