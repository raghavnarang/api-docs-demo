import type { DataSource } from '../../data-source'
import type { ApiCatalogRepository } from '../../repositories'

const catalog: ApiCatalogRepository = {
  async listApis() {
    // In-memory demo data so the DAL chain is exercised even before features.
    return [{ id: 'pokeapi', name: 'PokéAPI', version: '2.0.0' }]
  },
}

export function createMockDataSource(): DataSource {
  return { catalog }
}
