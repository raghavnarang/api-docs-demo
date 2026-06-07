import type { UseMutationResult } from '@tanstack/react-query'
import { StatusBadge } from '../../../components/StatusBadge'
import { CodeBlock } from '../../../components/CodeBlock'
import { EmptyState } from '../../../components/EmptyState'
import { ErrorState } from '../../../components/ErrorState'
import { SkeletonLines } from '../../../components/Skeleton'
import type {
  SandboxRequest,
  SandboxResponse,
} from '../../../lib/sandbox/rest-client'

/**
 * Renders the sandbox response across its four states: idle (nothing sent yet),
 * pending (skeleton), error (network failure), and success (status badge +
 * latency + formatted JSON body). HTTP errors (4xx/5xx) are successful mutations
 * — the request completed — so they render with the response status colour.
 */
function formatBody(body: unknown): string {
  if (typeof body === 'string') return body
  try {
    return JSON.stringify(body, null, 2)
  } catch {
    return String(body)
  }
}

export function ResponseViewer({
  mutation,
}: {
  mutation: UseMutationResult<SandboxResponse, Error, SandboxRequest>
}) {
  if (mutation.isIdle) {
    return (
      <EmptyState
        title="No response yet"
        message="Build a request above and hit Send to see the live response."
      />
    )
  }

  if (mutation.isPending) return <SkeletonLines lines={6} />

  if (mutation.isError) {
    return (
      <ErrorState
        title="Request failed"
        error={mutation.error}
        onRetry={() => mutation.variables && mutation.mutate(mutation.variables)}
      />
    )
  }

  const { status, latencyMs, body } = mutation.data
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <StatusBadge status={status} />
        <span className="text-sm text-slate-500">{latencyMs} ms</span>
      </div>
      <CodeBlock code={formatBody(body)} label="Copy response" />
    </div>
  )
}
