import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach } from 'vitest'

let mockDocs: { isPending: boolean; isError: boolean; isSuccess: boolean; data: string | null }

vi.mock('../hooks/use-catalog', () => ({
  useApiDocs: () => mockDocs,
}))

import { GettingStarted } from './GettingStarted'

beforeEach(() => {
  mockDocs = {
    isPending: false,
    isError: false,
    isSuccess: true,
    data: '# Quickstart\n\nFetch a resource with `curl`.\n',
  }
})

describe('GettingStarted', () => {
  test('renders the Markdown guide as HTML', () => {
    const { container } = render(<GettingStarted apiId="x" />)

    expect(container.querySelector('#getting-started')).not.toBeNull()
    expect(
      screen.getByRole('heading', { name: 'Quickstart' }),
    ).toBeInTheDocument()
    expect(screen.getByText('curl')).toBeInTheDocument()
  })

  test('omits the section when the API has no guide', () => {
    mockDocs = { isPending: false, isError: false, isSuccess: true, data: null }
    const { container } = render(<GettingStarted apiId="x" />)
    expect(container.querySelector('#getting-started')).toBeNull()
  })
})
