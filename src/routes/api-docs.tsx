import { createRoute } from '@tanstack/react-router'
import { appLayoutRoute } from './app-layout'
import { ApiDocsPage } from '../features/docs/components/ApiDocsPage'

/** Per-API scroll documentation page. */
export const apiDocsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/docs/$apiId',
  component: ApiDocsRouteComponent,
})

function ApiDocsRouteComponent() {
  const { apiId } = apiDocsRoute.useParams()
  return <ApiDocsPage apiId={apiId} />
}
