import { useId, useState, type FormEvent } from 'react'
import { Modal } from '../../../components/Modal'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { ErrorState } from '../../../components/ErrorState'
import type {
  ApiKeyEnvironment,
  CreatedApiKey,
} from '../../../lib/data/types'
import { useCreateApiKey } from '../hooks/use-api-keys'
import { createKeySchema, fieldErrors } from '../validation'

/**
 * Create-key form (§2.4): name, environment, optional expiry. On success it
 * hands the freshly minted `CreatedApiKey` (carrying the one-time secret) up to
 * the parent, which shows the reveal step.
 */
export function CreateKeyDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (key: CreatedApiKey) => void
}) {
  const envId = useId()
  const expiryId = useId()
  const [name, setName] = useState('')
  const [environment, setEnvironment] = useState<ApiKeyEnvironment>('sandbox')
  const [expiresAt, setExpiresAt] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const create = useCreateApiKey()

  const reset = () => {
    setName('')
    setEnvironment('sandbox')
    setExpiresAt('')
    setErrors({})
    create.reset()
  }

  const close = () => {
    reset()
    onClose()
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const parsed = createKeySchema.safeParse({ name, environment, expiresAt })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    create.mutate(
      {
        name: parsed.data.name,
        environment: parsed.data.environment,
        expiresAt: parsed.data.expiresAt || null,
      },
      {
        onSuccess: (created) => {
          reset()
          onCreated(created)
        },
      },
    )
  }

  return (
    <Modal open={open} onClose={close} title="Create API key">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Production server"
          error={errors.name}
          autoFocus
        />

        <Select
          id={envId}
          label="Environment"
          value={environment}
          onChange={(e) => setEnvironment(e.target.value as ApiKeyEnvironment)}
        >
          <option value="sandbox">Sandbox</option>
          <option value="production">Production</option>
        </Select>

        <Input
          id={expiryId}
          type="date"
          label="Expiry (optional)"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          error={errors.expiresAt}
        />

        {create.isError ? (
          <ErrorState title="Could not create key" error={create.error} />
        ) : null}

        <div className="mt-1 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={close}
            disabled={create.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Create key
          </Button>
        </div>
      </form>
    </Modal>
  )
}
