import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from './authenticated'
import { UsageAnalyticsPage } from '../features/analytics/components/UsageAnalyticsPage'

/** Protected Usage Analytics Dashboard section (§2.5). */
export const analyticsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/analytics',
  component: UsageAnalyticsPage,
})
