import { createRoute, redirect } from '@tanstack/react-router'
import { appLayoutRoute } from './app-layout'

/** Root path redirects into the docs catalogue — the portal's default landing. */
export const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/docs' })
  },
})
