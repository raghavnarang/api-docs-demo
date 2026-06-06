import { describe, test, expect } from 'vitest'
import { authenticatedRoute } from './authenticated'
import type { AuthSession } from '../lib/auth/types'

const session: AuthSession = {
  user: { id: 'u1', email: 'dev@example.com' },
  token: 'tok',
}

function runGuard(currentSession: AuthSession | null, href = '/keys') {
  const beforeLoad = authenticatedRoute.options.beforeLoad as (args: {
    context: { auth: { session: AuthSession | null } }
    location: { href: string }
  }) => void
  return beforeLoad({ context: { auth: { session: currentSession } }, location: { href } })
}

describe('authenticatedRoute guard', () => {
  test('redirects to /login (preserving the requested path) when signed out', () => {
    let thrown: unknown
    try {
      runGuard(null, '/sandbox')
    } catch (e) {
      thrown = e
    }
    expect(thrown).toBeDefined()
    // redirect() returns a thrown descriptor; assert it targets login + carries
    // the original path so the user returns there after signing in.
    const serialized = JSON.stringify(thrown)
    expect(serialized).toContain('/login')
    expect(serialized).toContain('/sandbox')
  })

  test('allows the load to proceed when a session exists', () => {
    expect(() => runGuard(session)).not.toThrow()
  })
})
