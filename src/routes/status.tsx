import { createRoute } from '@tanstack/react-router'
import { appLayoutRoute } from './app-layout'
import { StatusIndexPage } from '../features/status/components/StatusIndexPage'
import { StatusPage } from '../features/status/components/StatusPage'

/** Public status index (§2.6) — all registered APIs with current health. */
export const statusIndexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/status',
  component: StatusIndexPage,
})

/** Public per-API status page (§2.6) — global infra health, no auth. */
export const statusApiRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/status/$apiId',
  component: StatusApiRouteComponent,
})

function StatusApiRouteComponent() {
  const { apiId } = statusApiRoute.useParams()
  return <StatusPage apiId={apiId} />
}
