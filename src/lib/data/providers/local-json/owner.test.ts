import { describe, expect, test } from 'vitest'
import { resolveOwner } from './owner'

/** Build an unsigned JWT-shaped token with the given payload (base64url). */
function jwt(payload: Record<string, unknown>): string {
  const b64 = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj)).replace(/=+$/, '')
  return `${b64({ alg: 'none' })}.${b64(payload)}.sig`
}

describe('resolveOwner', () => {
  test('decodes the JWT sub claim', () => {
    expect(resolveOwner(jwt({ sub: 'user-123' }))).toBe('user-123')
  })

  test('same sub from different tokens resolves to the same owner', () => {
    const a = jwt({ sub: 'user-123', iat: 1 })
    const b = jwt({ sub: 'user-123', iat: 2 })
    expect(resolveOwner(a)).toBe(resolveOwner(b))
  })

  test('falls back to the raw token when not a JWT', () => {
    expect(resolveOwner('mock-token')).toBe('mock-token')
  })

  test('falls back when the JWT payload is malformed or lacks sub', () => {
    expect(resolveOwner('a.b.c')).toBe('a.b.c')
    expect(resolveOwner(jwt({ email: 'x@y.z' }))).toBe(jwt({ email: 'x@y.z' }))
  })
})
