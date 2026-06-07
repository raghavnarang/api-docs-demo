import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from './authenticated'
import { SandboxPanel } from '../features/sandbox/components/SandboxPanel'

/** Deep-link selection preloaded from docs ("Try in sandbox") or a shared URL. */
export interface SandboxSearch {
  api?: string
  endpoint?: string
}

/** Protected Interactive Sandbox section (§2.3). */
export const sandboxRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/sandbox',
  validateSearch: (search: Record<string, unknown>): SandboxSearch => ({
    api: typeof search.api === 'string' ? search.api : undefined,
    endpoint: typeof search.endpoint === 'string' ? search.endpoint : undefined,
  }),
  component: SandboxPanel,
})
