/**
 * Sandbox request executor. ALWAYS REST — independent of the DAL data-source
 * selection. External-developer test requests always hit real REST endpoints.
 * The HTTP method is just a field on the request; it decides the wire call,
 * not which TanStack Query hook wraps it (sandbox uses useMutation for all).
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface SandboxRequest {
  method: HttpMethod
  url: string
  headers?: Record<string, string>
  body?: unknown
}

export interface SandboxResponse {
  status: number
  latencyMs: number
  body: unknown
}

export async function executeRequest(
  req: SandboxRequest,
): Promise<SandboxResponse> {
  const start = performance.now()
  const response = await fetch(req.url, {
    method: req.method,
    headers: req.headers,
    body: req.body == null ? undefined : JSON.stringify(req.body),
  })
  const latencyMs = Math.round(performance.now() - start)

  const text = await response.text()
  let body: unknown = text
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    // Non-JSON response — keep raw text.
  }

  return { status: response.status, latencyMs, body }
}
