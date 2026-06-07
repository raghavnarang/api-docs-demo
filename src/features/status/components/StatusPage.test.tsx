import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { ApiStatus } from '../../../lib/data/types'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}))

const useApiStatus = vi.fn()
vi.mock('../hooks/use-status', () => ({
  useApiStatus: (apiId: string) => useApiStatus(apiId),
}))

const { StatusPage } = await import('./StatusPage')

// Recent timestamps so the incident lands inside the feed's day window.
const started = new Date(Date.now() - 24 * 3_600_000).toISOString()
const resolved = new Date(Date.now() - 22 * 3_600_000).toISOString()

const sample: ApiStatus = {
  apiId: 'pokeapi',
  apiName: 'PokéAPI',
  health: 'operational',
  uptime90d: 0.9987,
  days: [
    { date: '2026-03-10', uptime: 1 },
    { date: '2026-03-11', uptime: 0.8 },
  ],
  incidents: [
    {
      id: 'pokeapi-inc-1',
      title: 'Elevated error rates',
      impact: 'degraded',
      status: 'resolved',
      startedAt: started,
      resolvedAt: resolved,
      updates: [
        { status: 'Resolved', body: 'Cache rolled back.', timestamp: resolved },
        {
          status: 'Investigating',
          body: 'We are investigating reports of elevated error rates.',
          timestamp: started,
        },
      ],
    },
  ],
}

describe('StatusPage', () => {
  beforeEach(() => vi.clearAllMocks())

  test('queries the status for the given API id', () => {
    useApiStatus.mockReturnValue({ isPending: true })
    render(<StatusPage apiId="pokeapi" />)
    expect(useApiStatus).toHaveBeenCalledWith('pokeapi')
  })

  test('shows the error state when the query fails', () => {
    useApiStatus.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error('boom'),
    })
    render(<StatusPage apiId="pokeapi" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  test('shows the unknown-API empty state when status is null', () => {
    useApiStatus.mockReturnValue({
      isPending: false,
      isError: false,
      data: null,
    })
    render(<StatusPage apiId="nope" />)
    expect(screen.getByText(/unknown api/i)).toBeInTheDocument()
  })

  test('renders health, uptime, and incident history when present', () => {
    useApiStatus.mockReturnValue({
      isPending: false,
      isError: false,
      data: sample,
    })
    render(<StatusPage apiId="pokeapi" />)
    expect(screen.getByText('PokéAPI')).toBeInTheDocument()
    expect(screen.getByText('Operational')).toBeInTheDocument()
    expect(screen.getByText('99.87%')).toBeInTheDocument()
    expect(screen.getByText('Elevated error rates')).toBeInTheDocument()
  })
})
