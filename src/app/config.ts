/**
 * Single source of truth for adapter selection.
 *
 * The app reads `appConfig` — never `import.meta.env` directly. Env vars are
 * reserved for provider secrets (read inside each adapter factory) and optional
 * deploy-time overrides. To swap a data source or auth provider, change the
 * value here; the typed registries guarantee a matching adapter exists.
 */

export type DataSourceKind = 'mock' | 'rest' | 'graphql' | 'local-json'

export type AuthProviderKind =
  | 'mock'
  | 'supabase'
  | 'firebase'
  | 'auth0'
  | 'custom-jwt'

export interface AppConfig {
  /** Which DAL adapter backs all app data (docs, keys, analytics, …). */
  dataSource: DataSourceKind
  /** Which auth provider backs sign-in/session. */
  authProvider: AuthProviderKind
  /** Sandbox is ALWAYS REST, independent of `dataSource`. */
  sandbox: {
    defaultBaseUrl: string
  }
}

export const appConfig: AppConfig = {
  dataSource: 'local-json',
  authProvider: 'mock',
  sandbox: {
    defaultBaseUrl: 'https://pokeapi.co/api/v2',
  },
}
