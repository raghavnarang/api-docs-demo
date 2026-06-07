import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { appLayoutRoute } from './routes/app-layout'
import { indexRoute } from './routes/index'
import { docsIndexRoute } from './routes/docs'
import { apiDocsRoute } from './routes/api-docs'
import { loginRoute } from './routes/login'
import { authenticatedRoute } from './routes/authenticated'
import { keysRoute } from './routes/keys'
import { sandboxRoute } from './routes/sandbox'
import { analyticsRoute } from './routes/analytics'

const routeTree = rootRoute.addChildren([
  loginRoute,
  appLayoutRoute.addChildren([
    indexRoute,
    docsIndexRoute,
    apiDocsRoute,
    authenticatedRoute.addChildren([keysRoute, sandboxRoute, analyticsRoute]),
  ]),
])

export const router = createRouter({
  routeTree,
  // Real auth is supplied by RouterProvider; this placeholder satisfies the type.
  context: { auth: undefined! },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
