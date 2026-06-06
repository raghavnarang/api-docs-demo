import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthProvider, AuthSession, SignInCredentials } from './types'
import { getAuthProvider } from './auth-source'

export interface AuthContextValue {
  session: AuthSession | null
  loading: boolean
  signIn: (credentials: SignInCredentials) => Promise<void>
  /**
   * Returns the new session. When the provider requires email confirmation no
   * real session exists yet, signalled by an empty `token` (the UI then prompts
   * the user to check their inbox instead of redirecting).
   */
  signUp: (credentials: SignInCredentials) => Promise<AuthSession>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const provider: AuthProvider = useMemo(() => getAuthProvider(), [])
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    provider.getSession().then((current) => {
      if (!mounted) return
      setSession(current)
      setLoading(false)
    })
    const unsubscribe = provider.onAuthStateChange(setSession)
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [provider])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      signIn: async (credentials) => {
        await provider.signIn(credentials)
      },
      signUp: (credentials) => provider.signUp(credentials),
      signOut: () => provider.signOut(),
    }),
    [provider, session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthContextProvider')
  }
  return ctx
}
