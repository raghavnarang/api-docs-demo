import { render, screen, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import type { ApiKey } from '../../../lib/data/types'
import { KeyList } from './KeyList'

const baseKey: ApiKey = {
  id: '1',
  name: 'Active key',
  environment: 'sandbox',
  maskedKey: 'sk_sandbox_••••••••abcd',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastUsedAt: null,
  expiresAt: null,
  status: 'active',
}

function row(name: string) {
  return screen.getByText(name).closest('tr') as HTMLElement
}

describe('KeyList', () => {
  test('renders masked key, environment, and "Never" last-used', () => {
    render(<KeyList keys={[baseKey]} onRevoke={() => {}} />)
    const r = row('Active key')
    expect(within(r).getByText('sk_sandbox_••••••••abcd')).toBeInTheDocument()
    expect(within(r).getByText('sandbox')).toBeInTheDocument()
    expect(within(r).getByText('Never')).toBeInTheDocument()
    expect(within(r).getByText('Active')).toBeInTheDocument()
  })

  test('revoked keys show the revoked status and a disabled revoke button', () => {
    render(
      <KeyList
        keys={[{ ...baseKey, name: 'Old key', status: 'revoked' }]}
        onRevoke={() => {}}
      />,
    )
    const r = row('Old key')
    expect(within(r).getByText('Revoked')).toBeInTheDocument()
    expect(within(r).getByRole('button', { name: 'Revoke' })).toBeDisabled()
  })

  test('active keys past their expiry render as Expired', () => {
    render(
      <KeyList
        keys={[{ ...baseKey, name: 'Stale', expiresAt: '2000-01-01T00:00:00.000Z' }]}
        onRevoke={() => {}}
      />,
    )
    expect(within(row('Stale')).getByText('Expired')).toBeInTheDocument()
  })

  test('clicking revoke calls back with the key', async () => {
    const onRevoke = vi.fn()
    render(<KeyList keys={[baseKey]} onRevoke={onRevoke} />)
    screen.getByRole('button', { name: 'Revoke' }).click()
    expect(onRevoke).toHaveBeenCalledWith(baseKey)
  })
})
