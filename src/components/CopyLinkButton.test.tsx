import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { CopyLinkButton } from './CopyLinkButton'

describe('CopyLinkButton', () => {
  test('copies the current URL with the anchor hash and shows feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(<CopyLinkButton anchorId="getPokemon" />)
    const button = screen.getByRole('button', {
      name: /copy link to this endpoint/i,
    })

    fireEvent.click(button)

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
    expect(writeText.mock.calls[0][0]).toBe(
      `${window.location.origin}${window.location.pathname}#getPokemon`,
    )
    // feedback flips the title to "Copied!"
    await waitFor(() => expect(button).toHaveAttribute('title', 'Copied!'))
  })
})
