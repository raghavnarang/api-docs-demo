import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from './authenticated'
import { KeysPanel } from '../features/keys/components/KeysPanel'

/** Protected API Key Management section (§2.4). */
export const keysRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/keys',
  component: KeysPanel,
})
