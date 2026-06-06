import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { AuthPage } from '../features/auth/components/AuthPage'

interface LoginSearch {
  /** Path to return to after a successful sign-in (set by the route guard). */
  redirect?: string
}

/**
 * Standalone auth page — child of the root route, so it renders outside the
 * portal shell (no sidebar/header). Already-authenticated users are bounced to
 * their intended destination (or the docs catalogue).
 */
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.session) {
      throw redirect({ to: search.redirect ?? '/docs' })
    }
  },
  component: LoginRouteComponent,
})

function LoginRouteComponent() {
  const { redirect: redirectTo } = loginRoute.useSearch()
  return <AuthPage redirectTo={redirectTo} />
}
