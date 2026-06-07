import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Modal } from './Modal'

/**
 * Harness that passes a brand-new `onClose` on every render — the exact
 * condition that used to make Modal re-focus its panel on each keystroke and
 * steal focus from inputs.
 */
function Harness() {
  const [value, setValue] = useState('')
  return (
    <Modal open onClose={() => {}} title="Test">
      <input
        aria-label="field"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </Modal>
  )
}

describe('Modal', () => {
  test('keeps focus on an input across re-renders (no focus steal)', () => {
    render(<Harness />)
    const input = screen.getByLabelText('field') as HTMLInputElement
    input.focus()
    expect(input).toHaveFocus()
    // Each change triggers a re-render with a fresh `onClose`; focus must stay
    // on the input (the regression re-focused the panel on every render).
    fireEvent.change(input, { target: { value: 'h' } })
    fireEvent.change(input, { target: { value: 'he' } })
    expect(input).toHaveValue('he')
    expect(input).toHaveFocus()
  })

  test('focuses the panel when no field inside is focused', () => {
    render(
      <Modal open onClose={() => {}} title="Confirm">
        <p>Are you sure?</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toHaveFocus()
  })
})
