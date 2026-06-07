import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { ApiKey } from '../../../lib/data/types'

// Control the data-layer hooks so we can exercise each panel state in isolation.
const useApiKeys = vi.fn()
const noopMutation = {
  mutate: vi.fn(),
  reset: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
}
vi.mock('../hooks/use-api-keys', () => ({
  useApiKeys: () => useApiKeys(),
  useCreateApiKey: () => noopMutation,
  useRevokeApiKey: () => noopMutation,
}))

const { KeysPanel } = await import('./KeysPanel')

const sampleKey: ApiKey = {
  id: '1',
  name: 'My key',
  environment: 'sandbox',
  maskedKey: 'sk_sandbox_••••••••abcd',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastUsedAt: null,
  expiresAt: null,
  status: 'active',
}

describe('KeysPanel states', () => {
  beforeEach(() => vi.clearAllMocks())

  test('shows the empty state when there are no keys', () => {
    useApiKeys.mockReturnValue({ data: [], isLoading: false, isError: false })
    render(<KeysPanel />)
    expect(screen.getByText(/no api keys yet/i)).toBeInTheDocument()
  })

  test('shows an error state with retry on failure', () => {
    useApiKeys.mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('nope'),
      refetch: vi.fn(),
    })
    render(<KeysPanel />)
    expect(screen.getByText(/could not load keys/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  test('renders the key list when data is present', () => {
    useApiKeys.mockReturnValue({
      data: [sampleKey],
      isLoading: false,
      isError: false,
    })
    render(<KeysPanel />)
    expect(screen.getByText('My key')).toBeInTheDocument()
    expect(screen.getByText('sk_sandbox_••••••••abcd')).toBeInTheDocument()
  })
})
