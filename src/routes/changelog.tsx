import { createRoute } from '@tanstack/react-router'
import { appLayoutRoute } from './app-layout'
import { ChangelogPage } from '../features/changelog/components/ChangelogPage'

/** Selected API, preloaded from a "View changelog" link or a shared URL. */
export interface ChangelogSearch {
  api?: string
}

/** Public Changelog section (§2.7) — per-API versioned entries, no auth. */
export const changelogRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/changelog',
  validateSearch: (search: Record<string, unknown>): ChangelogSearch => ({
    api: typeof search.api === 'string' ? search.api : undefined,
  }),
  component: ChangelogPage,
})
