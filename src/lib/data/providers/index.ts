import type { DataSourceKind } from '../../../app/config'
import type { DataSource } from '../data-source'
import { createMockDataSource } from './mock'
import { createLocalJsonDataSource } from './local-json'

/**
 * Type-safe adapter registry: every DataSourceKind must map to a factory, so
 * adding a kind to the union forces a registry entry (compile error otherwise).
 * Unimplemented adapters throw only when actually selected + invoked.
 */
export const dataSourceRegistry: Record<DataSourceKind, () => DataSource> = {
  'local-json': () => createLocalJsonDataSource(),
  mock: createMockDataSource,
  rest: notImplemented('rest'),
  graphql: notImplemented('graphql'),
}

function notImplemented(kind: string): () => DataSource {
  return () => {
    throw new Error(`Data source "${kind}" is not implemented yet`)
  }
}
