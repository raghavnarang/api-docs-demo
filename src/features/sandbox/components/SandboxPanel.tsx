import { TerminalSquare } from 'lucide-react'
import { EmptyState } from '../../../components/EmptyState'

/**
 * Placeholder for the Interactive Sandbox section (§2.3). Lives behind the auth
 * guard so it demonstrates protected-route behaviour now; the live request
 * builder + snippet generator land with that section.
 */
export function SandboxPanel() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-xl font-semibold text-slate-900">Sandbox</h1>
      <p className="mt-1 text-sm text-slate-500">
        Fire real requests against registered APIs and generate code snippets.
      </p>
      <div className="mt-6">
        <EmptyState
          icon={<TerminalSquare className="h-7 w-7" aria-hidden />}
          title="Sandbox coming soon"
          message="This protected section is reserved for §2.3 Interactive Sandbox."
        />
      </div>
    </div>
  )
}
