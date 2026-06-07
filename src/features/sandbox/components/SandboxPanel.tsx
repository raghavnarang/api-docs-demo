import { useMemo } from 'react'
import { Send } from 'lucide-react'
import { sandboxRoute } from '../../../routes/sandbox'
import { Button } from '../../../components/Button'
import { EmptyState } from '../../../components/EmptyState'
import { useApis, useApiEndpoints } from '../../docs/hooks/use-catalog'
import {
  useSandboxForm,
  useExecuteRequest,
} from '../hooks/use-sandbox-request'
import { EndpointSelector } from './EndpointSelector'
import { RequestBuilder } from './RequestBuilder'
import { ResponseViewer } from './ResponseViewer'
import { SnippetTabs } from './SnippetTabs'

/**
 * Interactive Sandbox (§2.3). Selectors choose an API + endpoint (preloadable via
 * `/sandbox?api=&endpoint=` from docs deep-links); the controller hook seeds an
 * editable request from the spec; Send fires a real REST call via `useMutation`
 * and the result + matching code snippets render below.
 */
export function SandboxPanel() {
  const search = sandboxRoute.useSearch()
  const navigate = sandboxRoute.useNavigate()

  const apis = useApis()
  const endpoints = useApiEndpoints(search.api ?? '')

  const baseUrl = useMemo(
    () => apis.data?.find((a) => a.id === search.api)?.baseUrl ?? '',
    [apis.data, search.api],
  )
  const endpoint = useMemo(
    () => endpoints.data?.find((e) => e.id === search.endpoint),
    [endpoints.data, search.endpoint],
  )

  const form = useSandboxForm(endpoint, baseUrl)
  const mutation = useExecuteRequest()

  const missingRequiredPath = useMemo(() => {
    if (!endpoint) return false
    const required = new Set(
      endpoint.params
        .filter((p) => p.in === 'path' && p.required)
        .map((p) => p.name),
    )
    return form.form.pathParams.some(
      (row) => required.has(row.key) && !row.value.trim(),
    )
  }, [endpoint, form.form.pathParams])

  const canSend =
    Boolean(form.request) && form.bodyValidation.ok && !missingRequiredPath

  const onSend = () => {
    if (form.request) mutation.mutate(form.request)
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-xl font-semibold text-slate-900">Sandbox</h1>
      <p className="mt-1 text-sm text-slate-500">
        Fire real requests against registered APIs and generate code snippets.
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 p-4">
        <EndpointSelector
          apiId={search.api}
          endpointId={search.endpoint}
          onApiChange={(api) =>
            navigate({ search: { api, endpoint: undefined } })
          }
          onEndpointChange={(endpointId) =>
            navigate({ search: { api: search.api, endpoint: endpointId } })
          }
        />
      </div>

      {endpoint && form.request ? (
        <>
          <div className="mt-6 rounded-lg border border-slate-200 p-4">
            <RequestBuilder
              endpoint={endpoint}
              urlPreview={form.request.url}
              form={form.form}
              setPathParams={form.setPathParams}
              setQueryParams={form.setQueryParams}
              setHeaders={form.setHeaders}
              setBody={form.setBody}
              injectAuth={form.injectAuth}
              setInjectAuth={form.setInjectAuth}
              isLoggedIn={form.isLoggedIn}
              bodyValidation={form.bodyValidation}
            />
            <div className="mt-6 flex justify-end">
              <Button onClick={onSend} loading={mutation.isPending} disabled={!canSend}>
                {!mutation.isPending ? (
                  <Send className="h-4 w-4" aria-hidden />
                ) : null}
                Send
              </Button>
            </div>
          </div>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Response
            </h2>
            <ResponseViewer mutation={mutation} />
          </section>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Code snippet
            </h2>
            <SnippetTabs request={form.request} />
          </section>
        </>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="Pick an endpoint to start"
            message="Choose an API and endpoint above, or open the sandbox from any endpoint's “Try in sandbox” link in the docs."
          />
        </div>
      )}
    </div>
  )
}
