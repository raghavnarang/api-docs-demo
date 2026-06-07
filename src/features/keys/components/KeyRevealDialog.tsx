import { AlertTriangle } from 'lucide-react'
import { Modal } from '../../../components/Modal'
import { Button } from '../../../components/Button'
import { CodeBlock } from '../../../components/CodeBlock'
import type { CreatedApiKey } from '../../../lib/data/types'

/**
 * One-time secret reveal (§2.4): shows the full plaintext key exactly once with
 * a copy button and a clear warning that it will not be shown again. Closing
 * discards the secret — the list afterwards only ever shows the masked form.
 */
export function KeyRevealDialog({
  apiKey,
  onClose,
}: {
  apiKey: CreatedApiKey | null
  onClose: () => void
}) {
  return (
    <Modal open={apiKey !== null} onClose={onClose} title="API key created">
      {apiKey ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Copy your key for{' '}
            <span className="font-medium text-slate-900">{apiKey.name}</span>{' '}
            now.
          </p>

          <CodeBlock code={apiKey.secret} label="Copy API key" />

          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              This is the only time the full key is shown. Store it securely —
              you won&apos;t be able to see it again.
            </span>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
