import { createClient, type Session } from '@supabase/supabase-js'
import type { AuthProvider, AuthSession, SignInCredentials } from '../../types'

/**
 * Supabase auth adapter. Implements the provider-agnostic `AuthProvider`
 * contract so the rest of the app never touches the Supabase SDK directly.
 *
 * Reload-persistence and silent token refresh come from the SDK defaults
 * (`persistSession` + `autoRefreshToken`), which store the session in
 * localStorage and refresh it in the background. The refreshed session is
 * forwarded to subscribers via `onAuthStateChange` (TOKEN_REFRESHED event),
 * keeping `useAuth()` and any token-injecting request layer current.
 */
export function createSupabaseAuthProvider(): AuthProvider {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase auth selected but VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are missing. ' +
        'Copy .env.example to .env and fill them in.',
    )
  }

  const supabase = createClient(url, key)

  return {
    async signIn({ email, password }: SignInCredentials) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw new Error(error.message)
      // signInWithPassword always returns a session on success.
      return toAuthSession(data.session!)
    },

    async signUp({ email, password }: SignInCredentials) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw new Error(error.message)
      // When email confirmation is enabled, `session` is null until the user
      // confirms. Signal that to the caller with a null token so the UI can
      // prompt the user to check their inbox instead of redirecting.
      if (!data.session) {
        return { user: { id: data.user?.id ?? '', email }, token: '' }
      }
      return toAuthSession(data.session)
    },

    async signOut() {
      const { error } = await supabase.auth.signOut()
      if (error) throw new Error(error.message)
    },

    async getSession() {
      const { data } = await supabase.auth.getSession()
      return data.session ? toAuthSession(data.session) : null
    },

    async getToken() {
      const { data } = await supabase.auth.getSession()
      return data.session?.access_token ?? null
    },

    onAuthStateChange(listener) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        listener(session ? toAuthSession(session) : null)
      })
      return () => data.subscription.unsubscribe()
    },
  }
}

/** Map a Supabase session onto the app's provider-agnostic `AuthSession`. */
export function toAuthSession(session: Session): AuthSession {
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? '',
    },
    token: session.access_token,
  }
}
