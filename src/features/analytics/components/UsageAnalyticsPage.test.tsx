import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { ApiKey, UsageReport } from '../../../lib/data/types'

// Plain anchor stub — the page renders a router Link to /keys in the empty state.
vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}))

// Control the data-layer hooks to exercise each state in isolation.
const useApiKeys = vi.fn()
const useKeyUsage = vi.fn()
vi.mock('../../keys/hooks/use-api-keys', () => ({
  useApiKeys: () => useApiKeys(),
}))
vi.mock('../hooks/use-analytics', () => ({
  useKeyUsage: (keyId: string, window: string) => useKeyUsage(keyId, window),
}))
// Keep Recharts out of jsdom — its ResponsiveContainer needs real layout.
vi.mock('./UsageChart', () => ({
  UsageChart: () => <div data-testid="usage-chart" />,
}))

const { UsageAnalyticsPage } = await import('./UsageAnalyticsPage')

const sampleKey: ApiKey = {
  id: 'key-1',
  name: 'Prod key',
  environment: 'production',
  maskedKey: 'sk_live_••••••••abcd',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastUsedAt: null,
  expiresAt: null,
  status: 'active',
}

const report: UsageReport = {
  keyId: 'key-1',
  window: '7d',
  summary: {
    totalCalls: 1234,
    errors4xx: 10,
    errors5xx: 2,
    errorRate: 0.0097,
    avgLatencyMs: 150,
  },
  series: [{ date: '2026-06-01', calls: 100, errors: 1, avgLatencyMs: 120 }],
  endpoints: [
    { method: 'GET', path: '/pokemon', calls: 1000, errorRate: 0.01, avgLatencyMs: 140 },
  ],
}

describe('UsageAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useKeyUsage.mockReturnValue({ isPending: true })
  })

  test('shows the empty state with a link to keys when there are no keys', () => {
    useApiKeys.mockReturnValue({ data: [], isLoading: false, isError: false })
    render(<UsageAnalyticsPage />)
    expect(screen.getByText(/no api keys yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /api keys/i })).toBeInTheDocument()
  })

  test('renders metrics, chart, and the per-endpoint table when data is present', () => {
    useApiKeys.mockReturnValue({
      data: [sampleKey],
      isLoading: false,
      isError: false,
    })
    useKeyUsage.mockReturnValue({ data: report, isPending: false, isError: false })
    render(<UsageAnalyticsPage />)
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByTestId('usage-chart')).toBeInTheDocument()
    expect(screen.getByText('/pokemon')).toBeInTheDocument()
  })

  test('switching the window re-queries with the new window', () => {
    useApiKeys.mockReturnValue({
      data: [sampleKey],
      isLoading: false,
      isError: false,
    })
    useKeyUsage.mockReturnValue({ data: report, isPending: false, isError: false })
    render(<UsageAnalyticsPage />)
    expect(useKeyUsage).toHaveBeenLastCalledWith('key-1', '7d')

    fireEvent.click(screen.getByRole('button', { name: /30 days/i }))
    expect(useKeyUsage).toHaveBeenLastCalledWith('key-1', '30d')
  })
})
