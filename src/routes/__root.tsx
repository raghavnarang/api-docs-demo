import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { AuthContextValue } from '../lib/auth/auth-context'

/** Auth state is injected at render time via `RouterProvider`'s `context` prop. */
export interface RouterContext {
  auth: AuthContextValue
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  return <Outlet />
}
