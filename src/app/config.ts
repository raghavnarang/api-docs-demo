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
  docs: {
    /**
     * How long a parsed OpenAPI spec stays fresh in the client cache before it is
     * re-parsed/refetched. Static `local-json` specs never change → `Infinity`
     * (parse once per session). A REST source should use a finite interval so
     * backend spec changes are picked up.
     */
    specCacheTtlMs: number
  }
}

export const appConfig: AppConfig = {
  dataSource: 'local-json',
  authProvider: 'mock',
  sandbox: {
    defaultBaseUrl: 'https://pokeapi.co/api/v2',
  },
  docs: {
    specCacheTtlMs: Number.POSITIVE_INFINITY,
  },
}
