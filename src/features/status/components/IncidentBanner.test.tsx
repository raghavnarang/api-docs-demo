import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { StatusBannerMessage } from '../../../lib/data/types'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}))

const useStatusBanner = vi.fn()
vi.mock('../hooks/use-status', () => ({
  useStatusBanner: () => useStatusBanner(),
}))

const { IncidentBanner } = await import('./IncidentBanner')

const msg = (
  level: StatusBannerMessage['level'],
  message: string,
  apiId?: string,
): StatusBannerMessage => ({ id: `b-${apiId ?? level}`, level, message, apiId })

describe('IncidentBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  test('renders nothing when there are no messages', () => {
    useStatusBanner.mockReturnValue({ data: [] })
    const { container } = render(<IncidentBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  test('shows each active message with a deep link to its API status', () => {
    useStatusBanner.mockReturnValue({
      data: [msg('degraded', 'Beta is experiencing degraded performance.', 'beta')],
    })
    render(<IncidentBanner />)
    expect(screen.getByRole('alert')).toHaveTextContent(/Beta is experiencing/i)
    expect(
      screen.getByRole('link', { name: /view status/i }),
    ).toBeInTheDocument()
  })

  test('renders all messages when multiple APIs are affected', () => {
    useStatusBanner.mockReturnValue({
      data: [
        msg('degraded', 'Beta is experiencing degraded performance.', 'beta'),
        msg('outage', 'Gamma is experiencing an outage.', 'gamma'),
      ],
    })
    render(<IncidentBanner />)
    expect(screen.getByRole('alert')).toHaveTextContent(/Beta/)
    expect(screen.getByRole('alert')).toHaveTextContent(/Gamma/)
  })

  test('dismisses for the session when the close button is clicked', () => {
    useStatusBanner.mockReturnValue({
      data: [msg('outage', 'Gamma is experiencing an outage.', 'gamma')],
    })
    render(<IncidentBanner />)
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  test('stays dismissed across a remount within the session', () => {
    useStatusBanner.mockReturnValue({
      data: [msg('outage', 'Gamma is experiencing an outage.', 'gamma')],
    })

    const first = render(<IncidentBanner />)
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    first.unmount()

    // On reload (remount) the dismissal persists via sessionStorage.
    render(<IncidentBanner />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
