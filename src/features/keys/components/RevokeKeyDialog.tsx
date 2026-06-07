import { ConfirmDialog } from '../../../components/ConfirmDialog'
import type { ApiKey } from '../../../lib/data/types'
import { useRevokeApiKey } from '../hooks/use-api-keys'

/**
 * Revoke confirmation (§2.4). Wraps the shared `ConfirmDialog` and the revoke
 * mutation; on success the list invalidates and the row flips to `revoked`
 * immediately.
 */
export function RevokeKeyDialog({
  apiKey,
  onClose,
}: {
  apiKey: ApiKey | null
  onClose: () => void
}) {
  const revoke = useRevokeApiKey()

  const onConfirm = () => {
    if (!apiKey) return
    revoke.mutate(apiKey.id, { onSuccess: onClose })
  }

  return (
    <ConfirmDialog
      open={apiKey !== null}
      title="Revoke API key"
      message={
        <>
          Revoke{' '}
          <span className="font-medium text-slate-900">{apiKey?.name}</span>?
          Any request using this key will stop working immediately. This cannot
          be undone.
        </>
      }
      confirmLabel="Revoke key"
      variant="danger"
      loading={revoke.isPending}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
