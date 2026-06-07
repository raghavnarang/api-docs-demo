import { lazy, Suspense } from 'react'
import { MethodBadge } from '../../../components/MethodBadge'
import { SkeletonLines } from '../../../components/Skeleton'
import type { EndpointDef } from '../../../lib/spec-parser'
import type { JsonParseResult, KeyValueRow } from '../../../lib/sandbox/build-request'
import { ParamRows } from './ParamRows'
import { AuthInjectToggle } from './AuthInjectToggle'

// CodeMirror is heavy; load the JSON body editor only when a body-carrying
// endpoint is selected so it stays out of the main bundle.
const BodyEditor = lazy(() =>
  import('./BodyEditor').then((m) => ({ default: m.BodyEditor })),
)

/**
 * Composes the editable request form for one endpoint: method + URL preview,
 * path/query/header rows, the auth-inject toggle, and the JSON body editor
 * (shown only for body-carrying methods). All state is owned by the controller
 * hook; this component is presentational.
 */
export function RequestBuilder({
  endpoint,
  urlPreview,
  form,
  setPathParams,
  setQueryParams,
  setHeaders,
  setBody,
  injectAuth,
  setInjectAuth,
  isLoggedIn,
  bodyValidation,
}: {
  endpoint: EndpointDef
  urlPreview: string
  form: {
    pathParams: KeyValueRow[]
    queryParams: KeyValueRow[]
    headers: KeyValueRow[]
    body: string
  }
  setPathParams: (rows: KeyValueRow[]) => void
  setQueryParams: (rows: KeyValueRow[]) => void
  setHeaders: (rows: KeyValueRow[]) => void
  setBody: (body: string) => void
  injectAuth: boolean
  setInjectAuth: (checked: boolean) => void
  isLoggedIn: boolean
  bodyValidation: JsonParseResult
}) {
  const requiredPath = new Set(
    endpoint.params.filter((p) => p.in === 'path' && p.required).map((p) => p.name),
  )
  const requiredQuery = new Set(
    endpoint.params.filter((p) => p.in === 'query' && p.required).map((p) => p.name),
  )
  const showBody = endpoint.method !== 'get'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
        <MethodBadge method={endpoint.method} />
        <code className="break-all font-mono text-xs text-slate-700">
          {urlPreview}
        </code>
      </div>

      {form.pathParams.length > 0 ? (
        <ParamRows
          title="Path parameters"
          rows={form.pathParams}
          onChange={setPathParams}
          lockKeys
          requiredNames={requiredPath}
        />
      ) : null}

      <ParamRows
        title="Query parameters"
        rows={form.queryParams}
        onChange={setQueryParams}
        addable
        requiredNames={requiredQuery}
      />

      <ParamRows
        title="Headers"
        rows={form.headers}
        onChange={setHeaders}
        addable
      />

      <AuthInjectToggle
        checked={injectAuth}
        onChange={setInjectAuth}
        isLoggedIn={isLoggedIn}
      />

      {showBody ? (
        <Suspense fallback={<SkeletonLines lines={4} />}>
          <BodyEditor
            value={form.body}
            onChange={setBody}
            validation={bodyValidation}
          />
        </Suspense>
      ) : null}
    </div>
  )
}
