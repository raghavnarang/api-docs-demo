import type { OpenAPIV3 } from 'openapi-types'
import type {
  ApiDetail,
  ApiSummary,
  EndpointSearchResult,
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
   * Full-text search across endpoints, descriptions, and parameters (§2.2).
   * Lives behind the DAL so the impl (in-memory vs backend) is swappable;
   * callers debounce the query on the client.
   */
  searchEndpoints(query: string): Promise<EndpointSearchResult[]>
}
