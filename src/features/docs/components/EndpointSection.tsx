import { Link } from '@tanstack/react-router'
import { FlaskConical } from 'lucide-react'
import type { EndpointDef } from '../../../lib/spec-parser'
import { MethodBadge } from '../../../components/MethodBadge'
import { StatusBadge } from '../../../components/StatusBadge'
import { ParamsTable } from '../../../components/ParamsTable'
import { SchemaViewer } from '../../../components/SchemaViewer'
import { CopyLinkButton } from '../../../components/CopyLinkButton'

/**
 * Renders one endpoint entirely from its parsed `EndpointDef`: method badge,
 * path, description, params table, request-body schema, and response schemas.
 * The wrapping `<section id>` is the scroll/anchor target for the TOC. `apiId`
 * powers the "Try in sandbox" deep-link.
 */
export function EndpointSection({
  endpoint,
  apiId,
}: {
  endpoint: EndpointDef
  apiId: string
}) {
  const { method, path, summary, description, params, requestBody, responses } =
    endpoint

  return (
    <section
      id={endpoint.id}
      className="scroll-mt-20 border-t border-slate-200 py-8"
    >
      <div className="group flex flex-wrap items-center gap-2">
        <MethodBadge method={method} />
        <code className="font-mono text-sm text-slate-800">{path}</code>
        <CopyLinkButton anchorId={endpoint.id} />
        <Link
          to="/sandbox"
          search={{ api: apiId, endpoint: endpoint.id }}
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
        >
          <FlaskConical className="h-3.5 w-3.5" aria-hidden />
          Try in sandbox
        </Link>
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
