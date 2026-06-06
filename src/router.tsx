import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { appLayoutRoute } from './routes/app-layout'
import { indexRoute } from './routes/index'
import { docsIndexRoute } from './routes/docs'
import { apiDocsRoute } from './routes/api-docs'

const routeTree = rootRoute.addChildren([
  appLayoutRoute.addChildren([indexRoute, docsIndexRoute, apiDocsRoute]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
