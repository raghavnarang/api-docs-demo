import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { AppShell } from '../features/docs/components/AppShell'

/**
 * Pathless layout route hosting the persistent portal shell (sidebar + outlet).
 * All authenticated portal sections nest under this; standalone pages (e.g. a
 * future login) can stay outside it.
 */
export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: AppShell,
})
