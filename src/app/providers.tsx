import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { AuthContextProvider, useAuth } from '../lib/auth/auth-context'
import { router } from '../router'

/**
 * Composes the full provider chain:
 * QueryClientProvider (DAL) → AuthContextProvider (auth) → RouterProvider (routing).
 */
export function AppProviders() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <InnerApp />
      </AuthContextProvider>
    </QueryClientProvider>
  )
}

/**
 * Renders the router once the initial session has been restored, injecting auth
 * into the router context. Holding back until `loading` is false avoids a flash
 * of the login redirect on reload, and re-rendering with a fresh `auth` value on
 * every session change re-runs route `beforeLoad` guards automatically.
 */
function InnerApp() {
  const auth = useAuth()

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Loading" />
      </div>
    )
  }

  return <RouterProvider router={router} context={{ auth }} />
}
