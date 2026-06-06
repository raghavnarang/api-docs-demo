import { createRoute, Outlet, redirect } from '@tanstack/react-router'
import { appLayoutRoute } from './app-layout'

/**
 * Pathless guard layout for protected portal sections (keys, sandbox, …).
 * Runs inside the portal shell but before any child loads: unauthenticated
 * visitors are redirected to /login with the requested path preserved in
 * `redirect`, so they land back here after signing in.
 *
 * The guard reads `context.auth`, which RouterProvider re-injects whenever the
 * session changes — so signing in/out re-runs this check automatically.
 */
export const authenticatedRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  id: 'authenticated',
  beforeLoad: ({ context, location }) => {
    if (!context.auth.session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: Outlet,
})
