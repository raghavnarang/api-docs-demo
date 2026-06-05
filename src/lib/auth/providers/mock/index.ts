import type {
  AuthProvider,
  AuthSession,
  AuthStateListener,
  SignInCredentials,
} from '../../types'

/**
 * In-memory auth provider. Default during scaffolding so the auth chain is
 * exercised without a real backend. Holds one fake session in memory.
 */
export function createMockAuthProvider(): AuthProvider {
  let session: AuthSession | null = null
  const listeners = new Set<AuthStateListener>()
  const emit = () => listeners.forEach((listener) => listener(session))

  const makeSession = (email: string): AuthSession => ({
    user: { id: 'mock-user', email },
    token: 'mock-token',
  })

  return {
    async signIn({ email }: SignInCredentials) {
      session = makeSession(email)
      emit()
      return session
    },
    async signUp({ email }: SignInCredentials) {
      session = makeSession(email)
      emit()
      return session
    },
    async signOut() {
      session = null
      emit()
    },
    async getSession() {
      return session
    },
    async getToken() {
      return session?.token ?? null
    },
    onAuthStateChange(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
