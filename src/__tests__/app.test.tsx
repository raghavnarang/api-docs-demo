import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import { AppProviders } from '../app/providers'

test('boots the full provider chain and renders the home page', async () => {
  render(<AppProviders />)
  expect(await screen.findByText(/developer portal/i)).toBeInTheDocument()
})
