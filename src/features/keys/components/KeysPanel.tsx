import { KeyRound } from 'lucide-react'
import { EmptyState } from '../../../components/EmptyState'

/**
 * Placeholder for the API Key Management section (§2.4). Lives behind the auth
 * guard so it demonstrates protected-route behaviour now; the full create /
 * list / revoke UI lands with that section.
 */
export function KeysPanel() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-xl font-semibold text-slate-900">API Keys</h1>
      <p className="mt-1 text-sm text-slate-500">
        Create, list, and revoke keys for the sandbox and production
        environments.
      </p>
      <div className="mt-6">
        <EmptyState
          icon={<KeyRound className="h-7 w-7" aria-hidden />}
          title="Key management coming soon"
          message="This protected section is reserved for §2.4 API Key Management."
        />
      </div>
    </div>
  )
}
