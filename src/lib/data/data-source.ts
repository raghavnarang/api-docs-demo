import { appConfig } from '../../app/config'
import type { ApiCatalogRepository } from './repositories'
import { dataSourceRegistry } from './providers'

/**
 * A DataSource bundles every domain repository. Concrete adapters (mock, rest,
 * graphql, local-json) produce one of these. App code resolves the active
 * adapter via `getDataSource()` — selection comes from `appConfig.dataSource`.
 */
export interface DataSource {
  catalog: ApiCatalogRepository
}

export function getDataSource(): DataSource {
  return dataSourceRegistry[appConfig.dataSource]()
}
