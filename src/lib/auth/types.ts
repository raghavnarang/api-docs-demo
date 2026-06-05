/**
 * Provider-agnostic auth contract. Any backend (Supabase, Firebase, Auth0,
 * custom JWT, …) implements `AuthProvider`; the app depends only on this shape.
 */

export interface AuthUser {
  id: string
  email: string
}

export interface AuthSession {
  user: AuthUser
  token: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export type AuthStateListener = (session: AuthSession | null) => void

export interface AuthProvider {
  signIn(credentials: SignInCredentials): Promise<AuthSession>
  signUp(credentials: SignInCredentials): Promise<AuthSession>
  signOut(): Promise<void>
  getSession(): Promise<AuthSession | null>
  /** Current access token, for silent-refresh / request injection. */
  getToken(): Promise<string | null>
  /** Subscribe to session changes; returns an unsubscribe fn. */
  onAuthStateChange(listener: AuthStateListener): () => void
}
