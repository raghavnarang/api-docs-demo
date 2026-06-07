import { useState } from 'react'
import { KeyRound, Plus } from 'lucide-react'
import { EmptyState } from '../../../components/EmptyState'
import { ErrorState } from '../../../components/ErrorState'
import { SkeletonLines } from '../../../components/Skeleton'
import { Button } from '../../../components/Button'
import type { ApiKey, CreatedApiKey } from '../../../lib/data/types'
import { useApiKeys } from '../hooks/use-api-keys'
import { KeyList } from './KeyList'
import { CreateKeyDialog } from './CreateKeyDialog'
import { KeyRevealDialog } from './KeyRevealDialog'
import { RevokeKeyDialog } from './RevokeKeyDialog'

/**
 * API Key Management section (§2.4). Lists the signed-in user's keys and owns
 * the create / reveal / revoke dialog flow. Data comes from `useApiKeys`, which
 * is unaware of the backing data source. Handles loading, empty, and error
 * states explicitly.
 */
export function KeysPanel() {
  const { data: keys, isLoading, isError, error, refetch } = useApiKeys()
  const [createOpen, setCreateOpen] = useState(false)
  const [revealKey, setRevealKey] = useState<CreatedApiKey | null>(null)
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null)

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">API Keys</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, list, and revoke keys for the sandbox and production
            environments.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          Create key
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <SkeletonLines lines={4} />
        ) : isError ? (
          <ErrorState
            title="Could not load keys"
            error={error}
            onRetry={() => refetch()}
          />
        ) : !keys || keys.length === 0 ? (
          <EmptyState
            icon={<KeyRound className="h-7 w-7" aria-hidden />}
            title="No API keys yet"
            message="Create your first key to start making authenticated requests."
          />
        ) : (
          <KeyList keys={keys} onRevoke={setKeyToRevoke} />
        )}
      </div>

      <CreateKeyDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(created) => {
          setCreateOpen(false)
          setRevealKey(created)
        }}
      />
      <KeyRevealDialog apiKey={revealKey} onClose={() => setRevealKey(null)} />
      <RevokeKeyDialog
        apiKey={keyToRevoke}
        onClose={() => setKeyToRevoke(null)}
      />
    </div>
  )
}
