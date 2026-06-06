import { render, screen } from '@testing-library/react'
import { test, expect, describe } from 'vitest'
import type { SchemaNode } from '../lib/spec-parser'
import { SchemaViewer } from './SchemaViewer'

describe('SchemaViewer', () => {
  test('renders object properties with required + readOnly tags and rules', () => {
    const node: SchemaNode = {
      type: 'object',
      properties: [
        {
          name: 'amount',
          schema: { type: 'integer', required: true, minimum: 1, maximum: 100 },
        },
        { name: 'id', schema: { type: 'string', readOnly: true } },
        { name: 'note', schema: { type: 'string', required: false } },
      ],
    }
    render(<SchemaViewer node={node} />)

    expect(screen.getByText('amount')).toBeInTheDocument()
    expect(screen.getByText('required')).toBeInTheDocument()
    expect(screen.getByText('read-only')).toBeInTheDocument()
    // constraint chips
    expect(screen.getByText('≥ 1')).toBeInTheDocument()
    expect(screen.getByText('≤ 100')).toBeInTheDocument()
  })

  test('renders enum values as a rule chip', () => {
    const node: SchemaNode = {
      type: 'object',
      properties: [
        { name: 'status', schema: { type: 'string', enum: ['a', 'b'] } },
      ],
    }
    render(<SchemaViewer node={node} />)
    expect(screen.getByText('enum: a | b')).toBeInTheDocument()
  })

  test('renders oneOf variants with discriminator hint', () => {
    const node: SchemaNode = {
      composition: 'oneOf',
      discriminator: 'method',
      variants: [
        {
          type: 'object',
          properties: [{ name: 'card', schema: { type: 'string' } }],
        },
        {
          type: 'object',
          properties: [{ name: 'bank', schema: { type: 'string' } }],
        },
      ],
    }
    render(<SchemaViewer node={node} />)
    expect(screen.getByText(/one of \(by method\)/i)).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('card')).toBeInTheDocument()
    expect(screen.getByText('bank')).toBeInTheDocument()
  })

  test('marks cut $ref cycles', () => {
    render(<SchemaViewer node={{ type: 'object', circular: true }} />)
    expect(screen.getByText(/circular reference/i)).toBeInTheDocument()
  })
})
