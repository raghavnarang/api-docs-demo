/**
 * Pure assembler: editable sandbox form state → a concrete `SandboxRequest`.
 * No React, no I/O — the same assembled request feeds both `executeRequest`
 * (the live call) and `generateSnippet` (cURL/JS/Python), so snippets always
 * match what actually fires.
 */

import type { EndpointDef } from '../spec-parser'
import type { HttpMethod, SandboxRequest } from './rest-client'

/** One editable key/value row in the params or headers editor. */
export interface KeyValueRow {
  key: string
  value: string
  enabled: boolean
}

/** Editable request state owned by the sandbox UI, seeded from an `EndpointDef`. */
export interface SandboxFormState {
  /** Path params keyed by spec name (`{name}` tokens in the path). */
  pathParams: KeyValueRow[]
  queryParams: KeyValueRow[]
  headers: KeyValueRow[]
  /** Raw JSON body text (validated separately before sending). */
  body: string
}

export interface BuildRequestOptions {
  endpoint: EndpointDef
  baseUrl: string
  form: SandboxFormState
  /** Current session token; injected as a Bearer header when `injectAuth`. */
  authToken?: string | null
  injectAuth: boolean
}

export interface JsonParseResult {
  ok: boolean
  value?: unknown
  error?: string
}

/** Parse JSON text, never throwing — used for both validation and assembly. */
export function tryParseJson(text: string): JsonParseResult {
  const trimmed = text.trim()
  if (!trimmed) return { ok: true, value: undefined }
  try {
    return { ok: true, value: JSON.parse(trimmed) }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid JSON' }
  }
}

/** Methods that carry a request body in the sandbox. */
function methodAllowsBody(method: HttpMethod): boolean {
  return method !== 'GET'
}

function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}${suffix}`
}

function substitutePath(path: string, pathParams: KeyValueRow[]): string {
  const byName = new Map(pathParams.map((row) => [row.key, row.value]))
  return path.replace(/\{([^}]+)\}/g, (token, name: string) => {
    const value = byName.get(name)
    // Leave the token visible when unfilled so the user sees what's missing.
    return value ? encodeURIComponent(value) : token
  })
}

function buildQueryString(queryParams: KeyValueRow[]): string {
  const search = new URLSearchParams()
  for (const row of queryParams) {
    if (row.enabled && row.key.trim()) search.append(row.key, row.value)
  }
  const str = search.toString()
  return str ? `?${str}` : ''
}

function buildHeaders(
  headers: KeyValueRow[],
  injectAuth: boolean,
  authToken?: string | null,
): Record<string, string> | undefined {
  const result: Record<string, string> = {}
  for (const row of headers) {
    if (row.enabled && row.key.trim()) result[row.key] = row.value
  }
  // Auto-inject the session token, but never override a user-set Authorization.
  const hasAuth = Object.keys(result).some((k) => k.toLowerCase() === 'authorization')
  if (injectAuth && authToken && !hasAuth) {
    result.Authorization = `Bearer ${authToken}`
  }
  return Object.keys(result).length > 0 ? result : undefined
}

export function buildRequest(opts: BuildRequestOptions): SandboxRequest {
  const { endpoint, baseUrl, form, authToken, injectAuth } = opts
  const method = endpoint.method.toUpperCase() as HttpMethod

  const path = substitutePath(endpoint.path, form.pathParams)
  const url = joinUrl(baseUrl, path) + buildQueryString(form.queryParams)
  const headers = buildHeaders(form.headers, injectAuth, authToken)

  let body: unknown
  if (methodAllowsBody(method)) {
    const parsed = tryParseJson(form.body)
    // Invalid JSON is gated by the UI before send; omit it here defensively.
    if (parsed.ok) body = parsed.value
  }

  return { method, url, headers, body }
}
