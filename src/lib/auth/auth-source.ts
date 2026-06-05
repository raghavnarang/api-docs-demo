import { appConfig } from '../../app/config'
import type { AuthProvider } from './types'
import { authProviderRegistry } from './providers'

export function getAuthProvider(): AuthProvider {
  return authProviderRegistry[appConfig.authProvider]()
}
