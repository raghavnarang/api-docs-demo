import { describe, test, expect, vi, beforeEach } from 'vitest'

const authMock = {
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ auth: authMock }),
}))

import { createSupabaseAuthProvider, toAuthSession } from './index'

const fakeSession = (over: Record<string, unknown> = {}) => ({
  access_token: 'tok-123',
  user: { id: 'user-1', email: 'dev@example.com' },
  ...over,
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('toAuthSession', () => {
  test('maps a Supabase session onto the app AuthSession shape', () => {
    expect(toAuthSession(fakeSession() as never)).toEqual({
      user: { id: 'user-1', email: 'dev@example.com' },
      token: 'tok-123',
    })
  })

  test('falls back to empty email when Supabase omits it', () => {
    expect(toAuthSession(fakeSession({ user: { id: 'u', email: undefined } }) as never)).toEqual({
      user: { id: 'u', email: '' },
      token: 'tok-123',
    })
  })
})

describe('createSupabaseAuthProvider', () => {
  test('signIn throws the provider error message on failure', async () => {
    authMock.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    })
    const provider = createSupabaseAuthProvider()
    await expect(
      provider.signIn({ email: 'a@b.com', password: 'secret123' }),
    ).rejects.toThrow('Invalid login credentials')
  })

  test('signUp returns a session-less result (empty token) when confirmation is required', async () => {
    authMock.signUp.mockResolvedValue({
      data: { user: { id: 'u9' }, session: null },
      error: null,
    })
    const provider = createSupabaseAuthProvider()
    const result = await provider.signUp({ email: 'new@x.com', password: 'password1' })
    expect(result.token).toBe('')
    expect(result.user.email).toBe('new@x.com')
  })

  test('onAuthStateChange forwards mapped sessions and returns an unsubscribe fn', () => {
    const unsubscribe = vi.fn()
    authMock.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    })
    const provider = createSupabaseAuthProvider()
    const listener = vi.fn()
    const off = provider.onAuthStateChange(listener)

    const supabaseCallback = authMock.onAuthStateChange.mock.calls[0][0] as (
      event: string,
      session: unknown,
    ) => void

    supabaseCallback('SIGNED_IN', fakeSession())
    expect(listener).toHaveBeenCalledWith({
      user: { id: 'user-1', email: 'dev@example.com' },
      token: 'tok-123',
    })

    supabaseCallback('SIGNED_OUT', null)
    expect(listener).toHaveBeenCalledWith(null)

    off()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})
