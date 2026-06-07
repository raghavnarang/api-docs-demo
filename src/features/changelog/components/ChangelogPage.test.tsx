import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { ApiSummary, ChangelogEntry } from '../../../lib/data/types'

// Plain anchor stub — the page renders router Links for the docs/status CTAs.
vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}))

// Control the route search param + navigation.
const useSearch = vi.fn()
const navigate = vi.fn()
vi.mock('../../../routes/changelog', () => ({
  changelogRoute: {
    useSearch: () => useSearch(),
    useNavigate: () => navigate,
  },
}))

// Control the data-layer hooks to exercise each state in isolation.
const useApis = vi.fn()
const useApiChangelog = vi.fn()
vi.mock('../../docs/hooks/use-catalog', () => ({
  useApis: () => useApis(),
}))
vi.mock('../hooks/use-changelog', () => ({
  useApiChangelog: (apiId: string) => useApiChangelog(apiId),
}))

const { ChangelogPage } = await import('./ChangelogPage')

const apis: ApiSummary[] = [
  { id: 'pokeapi', name: 'PokéAPI', version: '2.0.0', baseUrl: 'https://x' },
  { id: 'tcgdex', name: 'TCGdex', version: '2.0.0', baseUrl: 'https://y' },
]

const entries: ChangelogEntry[] = [
  {
    id: 'a',
    version: '2.0.0',
    date: '2024-11-12',
    type: 'breaking',
    title: 'Removed v1 endpoints',
    description: 'Migrate to v2.',
  },
  {
    id: 'b',
    version: '1.9.0',
    date: '2024-08-03',
    type: 'feature',
    title: 'Added encounters',
    description: 'New encounter data.',
  },
]

describe('ChangelogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSearch.mockReturnValue({ api: 'pokeapi' })
    useApis.mockReturnValue({ data: apis, isLoading: false, isError: false })
    useApiChangelog.mockReturnValue({
      data: entries,
      isPending: false,
      isError: false,
    })
  })

  test('fetches the changelog for the API in the search param', () => {
    render(<ChangelogPage />)
    expect(useApiChangelog).toHaveBeenCalledWith('pokeapi')
  })

  test('renders all entries for the selected API by default', () => {
    render(<ChangelogPage />)
    expect(screen.getByText('Removed v1 endpoints')).toBeInTheDocument()
    expect(screen.getByText('Added encounters')).toBeInTheDocument()
  })

  test('type filter narrows the list client-side', () => {
    render(<ChangelogPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Feature' }))
    expect(screen.queryByText('Removed v1 endpoints')).not.toBeInTheDocument()
    expect(screen.getByText('Added encounters')).toBeInTheDocument()
  })

  test('shows an empty state when the active filter matches nothing', () => {
    useApiChangelog.mockReturnValue({
      data: [entries[1]], // feature only
      isPending: false,
      isError: false,
    })
    render(<ChangelogPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Breaking' }))
    expect(screen.getByText(/no breaking entries/i)).toBeInTheDocument()
  })

  test('changing the API picker navigates with the new api search param', () => {
    render(<ChangelogPage />)
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'tcgdex' },
    })
    expect(navigate).toHaveBeenCalledWith({ search: { api: 'tcgdex' } })
  })

  test('falls back to the first API when the search param is unknown', () => {
    useSearch.mockReturnValue({ api: undefined })
    render(<ChangelogPage />)
    expect(useApiChangelog).toHaveBeenCalledWith('pokeapi')
  })
})
