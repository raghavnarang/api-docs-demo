import { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { executeRequest } from '../../../lib/sandbox/rest-client'
import {
  buildRequest,
  tryParseJson,
  type KeyValueRow,
  type SandboxFormState,
} from '../../../lib/sandbox/build-request'
import { initialFormState } from '../../../lib/sandbox/form-init'
import type { EndpointDef } from '../../../lib/spec-parser'
import { useAuth } from '../../../lib/auth/auth-context'

/**
 * Imperative one-shot executor for sandbox requests. `useMutation` for every
 * verb — the HTTP method is a field on the request, not the hook selector (see
 * the always-REST note in `rest-client.ts`).
 */
export function useExecuteRequest() {
  return useMutation({ mutationFn: executeRequest })
}

const EMPTY_FORM: SandboxFormState = {
  pathParams: [],
  queryParams: [],
  headers: [],
  body: '',
}

/**
 * Owns the editable request form for the selected endpoint: seeds fields from the
 * spec, re-seeds on endpoint change, tracks the auth-inject toggle, and derives
 * both the live `SandboxRequest` and JSON-body validation. The same derived
 * request feeds Send and the snippet generators.
 */
export function useSandboxForm(
  endpoint: EndpointDef | undefined,
  baseUrl: string,
) {
  const { session } = useAuth()
  const [form, setForm] = useState<SandboxFormState>(() =>
    endpoint ? initialFormState(endpoint) : EMPTY_FORM,
  )
  const [injectAuth, setInjectAuth] = useState(false)

  // Re-seed whenever the selected endpoint changes (stable cached reference).
  useEffect(() => {
    setForm(endpoint ? initialFormState(endpoint) : EMPTY_FORM)
  }, [endpoint])

  const setPathParams = (rows: KeyValueRow[]) =>
    setForm((f) => ({ ...f, pathParams: rows }))
  const setQueryParams = (rows: KeyValueRow[]) =>
    setForm((f) => ({ ...f, queryParams: rows }))
  const setHeaders = (rows: KeyValueRow[]) =>
    setForm((f) => ({ ...f, headers: rows }))
  const setBody = (body: string) => setForm((f) => ({ ...f, body }))

  const bodyValidation = useMemo(() => tryParseJson(form.body), [form.body])

  const request = useMemo(
    () =>
      endpoint
        ? buildRequest({
            endpoint,
            baseUrl,
            form,
            authToken: session?.token,
            injectAuth,
          })
        : null,
    [endpoint, baseUrl, form, session?.token, injectAuth],
  )

  return {
    form,
    setPathParams,
    setQueryParams,
    setHeaders,
    setBody,
    injectAuth,
    setInjectAuth,
    isLoggedIn: Boolean(session?.token),
    bodyValidation,
    request,
  }
}
