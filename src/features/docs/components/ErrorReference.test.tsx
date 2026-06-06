import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach } from 'vitest'
import type { ErrorRefEntry } from '../../../lib/data/types'

const entries: ErrorRefEntry[] = [
  {
    code: '404',
    httpStatus: 404,
    title: 'Not Found',
    description: 'The resource does not exist.',
    resolution: 'Check the id.',
  },
  {
    code: 'CARD_DECLINED',
    httpStatus: 402,
    title: 'Card Declined',
    description: 'The issuing bank declined the card.',
  },
]

let mockErrors: { isPending: boolean; isError: boolean; isSuccess: boolean; data: ErrorRefEntry[] }

vi.mock('../hooks/use-catalog', () => ({
  useErrorReference: () => mockErrors,
}))

import { ErrorReference } from './ErrorReference'

beforeEach(() => {
  mockErrors = { isPending: false, isError: false, isSuccess: true, data: entries }
})

describe('ErrorReference', () => {
  test('renders both HTTP and app-level codes with status, title and resolution', () => {
    const { container } = render(<ErrorReference apiId="x" />)

    expect(container.querySelector('#error-reference')).not.toBeNull()
    // app-level code (no numeric collision)
    expect(screen.getByText('CARD_DECLINED')).toBeInTheDocument()
    // HTTP 404 appears twice: the code label and the status badge
    expect(screen.getAllByText('404')).toHaveLength(2)
    // 402 only as the status badge (the code is CARD_DECLINED)
    expect(screen.getByText('402')).toBeInTheDocument()
    expect(screen.getByText(/Not Found/)).toBeInTheDocument()
    // resolution rendered when present
    expect(screen.getByText('Check the id.')).toBeInTheDocument()
  })

  test('omits the section when the catalogue is empty', () => {
    mockErrors = { isPending: false, isError: false, isSuccess: true, data: [] }
    const { container } = render(<ErrorReference apiId="x" />)
    expect(container.querySelector('#error-reference')).toBeNull()
  })
})
