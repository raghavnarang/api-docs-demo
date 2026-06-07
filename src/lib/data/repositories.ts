import type { OpenAPIV3 } from 'openapi-types'
import type {
  ApiDetail,
  ApiKey,
  ApiSearchHit,
  ApiSummary,
  CreateApiKeyInput,
  CreatedApiKey,
  ErrorRefEntry,
} from './types'

/**
 * Per-domain repository contracts. Each data-source adapter implements these;
 * the app only ever depends on the interface, never a concrete source.
 */

export interface ApiCatalogRepository {
  /** Lightweight list for the sidebar/catalogue (no full specs). */
  listApis(): Promise<ApiSummary[]>
  /** Per-API metadata incl. SDK links. */
  getApi(id: string): Promise<ApiDetail | null>
  /** Full OpenAPI document — lazy-loaded for the docs view. */
  getSpec(id: string): Promise<OpenAPIV3.Document | null>
  /** Getting Started guide as raw markdown. */
  getDocs(id: string): Promise<string | null>
  /** Error reference catalogue. */
  getErrorReference(id: string): Promise<ErrorRefEntry[]>
  /**
   * Tier-2 cross-API full-text search (§2.2): which APIs contain the keyword
   * across endpoints, descriptions, and parameters. Id-agnostic — anchor ids are
   * a frontend concern, so this returns only `{apiId, apiName}`. The impl is
   * swappable: local-json scans its bundled specs, a REST adapter hits a backend
   * search endpoint. Callers debounce the query on the client.
   */
  searchApis(query: string): Promise<ApiSearchHit[]>
}

/**
 * API Key Management contract (§2.4). Identity flows as the caller's auth
 * `token` — never an `ownerId`. The adapter resolves the owner behind this
 * boundary: a REST adapter forwards the token as `Authorization` and lets the
 * server scope the result; the local-json adapter decodes the token to a stable
 * owner and partitions localStorage by it. The app never passes a user id.
 */
export interface ApiKeyRepository {
  /** Keys owned by the token's subject. */
  listKeys(token: string): Promise<ApiKey[]>
  /**
   * Mint a new key. The returned `CreatedApiKey` carries the plaintext secret
   * exactly once — it is never stored and cannot be retrieved again.
   */
  createKey(token: string, input: CreateApiKeyInput): Promise<CreatedApiKey>
  /** Revoke a key (kept in the list with `status: 'revoked'`). */
  revokeKey(token: string, id: string): Promise<void>
}
