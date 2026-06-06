import { createRoute } from '@tanstack/react-router'
import { appLayoutRoute } from './app-layout'
import { CatalogueGrid } from '../features/docs/components/CatalogueGrid'

/** Docs catalogue landing — grid of all registered APIs. */
export const docsIndexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/docs',
  component: CatalogueGrid,
})
