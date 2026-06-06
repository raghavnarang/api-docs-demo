import type { OpenAPIV3 } from 'openapi-types'
import type {
  ApiDetail,
  ApiSearchHit,
  ApiSummary,
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
