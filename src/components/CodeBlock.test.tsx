import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { CodeBlock } from './CodeBlock'

describe('CodeBlock', () => {
  test('renders the code and copies it on click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(<CodeBlock code="curl https://x.test" />)
    expect(screen.getByText('curl https://x.test')).toBeInTheDocument()

    const button = screen.getByRole('button', { name: /copy code/i })
    fireEvent.click(button)

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('curl https://x.test'))
    await waitFor(() => expect(button).toHaveAttribute('title', 'Copied!'))
  })
})
