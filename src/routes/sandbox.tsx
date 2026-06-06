import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from './authenticated'
import { SandboxPanel } from '../features/sandbox/components/SandboxPanel'

/** Protected Interactive Sandbox section (§2.3). */
export const sandboxRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/sandbox',
  component: SandboxPanel,
})
