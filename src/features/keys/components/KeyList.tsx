import type { ApiKey } from '../../../lib/data/types'
import { Button } from '../../../components/Button'
import { EnvironmentBadge } from './EnvironmentBadge'

/** Format an ISO timestamp as a short readable date, or a fallback when null. */
function formatDate(iso: string | null, fallback = '—'): string {
  if (!iso) return fallback
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function isExpired(key: ApiKey): boolean {
  return key.expiresAt !== null && new Date(key.expiresAt) <= new Date()
}

/**
 * Renders the user's keys (§2.4): masked value, environment badge, created /
 * last-used dates, lifecycle status, and a revoke action. Revoked keys are kept
 * but greyed; the revoke button is disabled for non-active keys. Presentation
 * only — revoke confirmation is owned by the parent panel.
 */
export function KeyList({
  keys,
  onRevoke,
}: {
  keys: ApiKey[]
  onRevoke: (key: ApiKey) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2.5 font-semibold">Name</th>
            <th className="px-4 py-2.5 font-semibold">Environment</th>
            <th className="px-4 py-2.5 font-semibold">Key</th>
            <th className="px-4 py-2.5 font-semibold">Created</th>
            <th className="px-4 py-2.5 font-semibold">Last used</th>
            <th className="px-4 py-2.5 font-semibold">Status</th>
            <th className="px-4 py-2.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {keys.map((key) => {
            const revoked = key.status === 'revoked'
            const expired = !revoked && isExpired(key)
            return (
              <tr
                key={key.id}
                className={revoked ? 'bg-slate-50/60 text-slate-400' : ''}
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {key.name}
                </td>
                <td className="px-4 py-3">
                  <EnvironmentBadge environment={key.environment} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">
                  {key.maskedKey}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatDate(key.createdAt)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatDate(key.lastUsedAt, 'Never')}
                </td>
                <td className="px-4 py-3">
                  {revoked ? (
                    <StatusPill tone="slate">Revoked</StatusPill>
                  ) : expired ? (
                    <StatusPill tone="amber">Expired</StatusPill>
                  ) : (
                    <StatusPill tone="green">Active</StatusPill>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="danger"
                    onClick={() => onRevoke(key)}
                    disabled={revoked}
                    className="px-2.5 py-1 text-xs"
                  >
                    Revoke
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const toneClasses = {
  green: 'bg-green-100 text-green-800',
  amber: 'bg-amber-100 text-amber-800',
  slate: 'bg-slate-200 text-slate-600',
} as const

function StatusPill({
  tone,
  children,
}: {
  tone: keyof typeof toneClasses
  children: string
}) {
  return (
    <span
      className={`inline-flex justify-center rounded px-2 py-0.5 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}
