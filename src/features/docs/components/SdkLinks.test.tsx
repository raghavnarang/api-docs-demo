import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach } from 'vitest'

const detail = {
  id: 'pokeapi',
  name: 'PokéAPI',
  version: '2.0.0',
  baseUrl: 'https://pokeapi.co',
  sdks: [
    {
      lang: 'JavaScript',
      install: 'npm install pokenode-ts',
      repo: 'https://github.com/Gabb-c/pokenode-ts',
    },
  ],
}

let mockApi: { isPending: boolean; isError: boolean; isSuccess: boolean; data: typeof detail | null }

vi.mock('../hooks/use-catalog', () => ({
  useApi: () => mockApi,
}))

import { SdkLinks } from './SdkLinks'

beforeEach(() => {
  mockApi = { isPending: false, isError: false, isSuccess: true, data: detail }
})

describe('SdkLinks', () => {
  test('renders SDK entries from config: lang, install command and repo link', () => {
    render(<SdkLinks apiId="pokeapi" />)

    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('npm install pokenode-ts')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /view repository/i })
    expect(link).toHaveAttribute('href', 'https://github.com/Gabb-c/pokenode-ts')
  })

  test('omits the section when the API lists no SDKs', () => {
    mockApi = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { ...detail, sdks: [] },
    }
    const { container } = render(<SdkLinks apiId="pokeapi" />)
    expect(container.querySelector('#sdks')).toBeNull()
  })
})
