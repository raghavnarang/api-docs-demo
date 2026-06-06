import { render, screen } from '@testing-library/react'
import { test, expect, describe } from 'vitest'
import type { UseQueryResult } from '@tanstack/react-query'
import { QueryBoundary } from './QueryBoundary'

function fakeQuery<T>(partial: Partial<UseQueryResult<T>>): UseQueryResult<T> {
  return {
    isPending: false,
    isError: false,
    data: undefined,
    error: null,
    refetch: () => Promise.resolve({} as never),
    ...partial,
  } as unknown as UseQueryResult<T>
}

describe('QueryBoundary', () => {
  test('shows the loading slot while pending', () => {
    render(
      <QueryBoundary
        query={fakeQuery<string[]>({ isPending: true })}
        skeleton={<p>loading…</p>}
      >
        {() => <p>data</p>}
      </QueryBoundary>,
    )
    expect(screen.getByText('loading…')).toBeInTheDocument()
  })

  test('shows an error state with the message on error', () => {
    render(
      <QueryBoundary
        query={fakeQuery<string[]>({ isError: true, error: new Error('boom') })}
      >
        {() => <p>data</p>}
      </QueryBoundary>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('boom')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  test('shows the empty state for an empty array', () => {
    render(
      <QueryBoundary query={fakeQuery<string[]>({ data: [] })}>
        {() => <p>data</p>}
      </QueryBoundary>,
    )
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument()
  })

  test('renders children with present, non-empty data', () => {
    render(
      <QueryBoundary query={fakeQuery<string[]>({ data: ['x'] })}>
        {(rows) => <p>got {rows.length}</p>}
      </QueryBoundary>,
    )
    expect(screen.getByText('got 1')).toBeInTheDocument()
  })
})
