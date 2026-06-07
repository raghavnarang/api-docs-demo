import { render, screen } from '@testing-library/react'
import { test, expect, describe, vi } from 'vitest'
import type { EndpointDef } from '../../../lib/spec-parser'

// Render the router Link as a plain anchor so the section can mount without a
// RouterProvider context.
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
  }: {
    children: React.ReactNode
    to?: string
  }) => <a href={to ?? '#'}>{children}</a>,
}))

import { EndpointSection } from './EndpointSection'

const endpoint: EndpointDef = {
  id: 'createPayment',
  method: 'post',
  path: '/payments',
  summary: 'Create a payment',
  params: [
    {
      name: 'idempotency-key',
      in: 'header',
      required: false,
      type: 'string',
      description: 'Dedup key',
    },
  ],
  requestBody: {
    required: true,
    contentTypes: ['application/json'],
    schema: {
      type: 'object',
      properties: [
        { name: 'amount', schema: { type: 'integer', required: true } },
      ],
    },
  },
  responses: [
    {
      status: '201',
      description: 'Created',
      schema: {
        type: 'object',
        properties: [{ name: 'id', schema: { type: 'string' } }],
      },
    },
    { status: '400', description: 'Bad request' },
  ],
}

describe('EndpointSection (data-driven, no hardcoded spec)', () => {
  test('renders method, path, params, body and responses from the EndpointDef', () => {
    const { container } = render(
      <EndpointSection endpoint={endpoint} apiId="payments" />,
    )

    // anchor target id == endpoint id
    expect(container.querySelector('#createPayment')).not.toBeNull()

    expect(screen.getByText('post')).toBeInTheDocument()
    expect(screen.getByText('/payments')).toBeInTheDocument()
    expect(screen.getByText('Create a payment')).toBeInTheDocument()

    // header param renders in the params table
    expect(screen.getByText('idempotency-key')).toBeInTheDocument()

    // request body field
    expect(screen.getByText('amount')).toBeInTheDocument()

    // both response status codes show as badges
    expect(screen.getByText('201')).toBeInTheDocument()
    expect(screen.getByText('400')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
  })
})
