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

interface AuthContextValue {
  session: AuthSession | null
  loading: boolean
  signIn: (credentials: SignInCredentials) => Promise<void>
  signUp: (credentials: SignInCredentials) => Promise<void>
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
      signUp: async (credentials) => {
        await provider.signUp(credentials)
      },
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
