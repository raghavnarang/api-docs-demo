import type { ApiSummary } from './types'

/**
 * Per-domain repository contracts. Each data-source adapter implements these;
 * the app only ever depends on the interface, never a concrete source.
 * Add a new repository interface here per domain as features land.
 */

export interface ApiCatalogRepository {
  listApis(): Promise<ApiSummary[]>
}
