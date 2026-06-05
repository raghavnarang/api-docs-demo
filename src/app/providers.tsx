import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthContextProvider } from '../lib/auth/auth-context'
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
        <RouterProvider router={router} />
      </AuthContextProvider>
    </QueryClientProvider>
  )
}
