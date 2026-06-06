import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach } from 'vitest'
import type { ApiEndpointMatches } from '../hooks/use-global-search'

const navigateMock = vi.fn()
let mockSearch: {
  groups: ApiEndpointMatches[]
  isLoading: boolean
  isError: boolean
  debounced: string
}

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}))
vi.mock('../hooks/use-global-search', () => ({
  useGlobalSearch: () => mockSearch,
}))

import { SearchDialog } from './SearchDialog'

const groups: ApiEndpointMatches[] = [
  {
    apiId: 'pokeapi',
    apiName: 'PokéAPI',
    endpoints: [
      {
        id: 'listPokemon',
        method: 'get',
        path: '/api/v2/pokemon',
        summary: 'List Pokémon',
        params: [],
        responses: [],
      },
    ],
  },
]

beforeEach(() => {
  navigateMock.mockReset()
  mockSearch = { groups: [], isLoading: false, isError: false, debounced: '' }
})

describe('SearchDialog', () => {
  test('shows a hint when the query is empty', () => {
    render(<SearchDialog />)
    expect(screen.getByText(/type to search/i)).toBeInTheDocument()
  })

  test('shows the empty state when a non-empty query has no matches', () => {
    mockSearch = { groups: [], isLoading: false, isError: false, debounced: 'xyz' }
    render(<SearchDialog />)
    expect(screen.getByText('No matches')).toBeInTheDocument()
  })

  test('shows a loading skeleton while searching', () => {
    mockSearch = { groups: [], isLoading: true, isError: false, debounced: 'po' }
    const { container } = render(<SearchDialog />)
    expect(container.querySelector('.animate-pulse')).not.toBeNull()
  })

  test('shows the error state on failure', () => {
    mockSearch = { groups: [], isLoading: false, isError: true, debounced: 'po' }
    render(<SearchDialog />)
    expect(screen.getByText('Search failed')).toBeInTheDocument()
  })

  test('renders grouped endpoint rows and deep-links on click', () => {
    mockSearch = { groups, isLoading: false, isError: false, debounced: 'pokemon' }
    render(<SearchDialog />)

    expect(screen.getByText('PokéAPI')).toBeInTheDocument()
    expect(screen.getByText('/api/v2/pokemon')).toBeInTheDocument()

    fireEvent.click(screen.getByText('/api/v2/pokemon'))
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/docs/$apiId',
      params: { apiId: 'pokeapi' },
      hash: 'listPokemon',
    })
  })
})
