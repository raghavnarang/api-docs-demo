import { API_REGISTRY, type ApiDefinition } from '../../../../apis/api-registry'
import type { DataSource } from '../../data-source'
import type { ApiCatalogRepository } from '../../repositories'
import { searchEndpoints } from './endpoint-search'

/**
 * Reads the API catalogue from the static `API_REGISTRY` (+ each entry's bundled
 * spec/docs/errors). The registry is injectable so the adapter is testable.
 * Swapping to a `rest` adapter later needs no app/component change.
 */
export function createLocalJsonDataSource(
  registry: ApiDefinition[] = API_REGISTRY,
): DataSource {
  const find = (id: string) => registry.find((api) => api.id === id) ?? null

  const catalog: ApiCatalogRepository = {
    async listApis() {
      return registry.map(({ id, name, version, baseUrl, description }) => ({
        id,
        name,
        version,
        baseUrl,
        description,
      }))
    },
    async getApi(id) {
      const api = find(id)
      if (!api) return null
      const { spec: _spec, docs: _docs, errorReference: _err, ...rest } = api
      return { ...rest, sdks: api.sdks ?? [] }
    },
    async getSpec(id) {
      return find(id)?.spec ?? null
    },
    async getDocs(id) {
      return find(id)?.docs ?? null
    },
    async getErrorReference(id) {
      return find(id)?.errorReference ?? []
    },
    async searchEndpoints(query) {
      return searchEndpoints(
        registry.map(({ id, name, spec }) => ({ id, name, spec })),
        query,
      )
    },
  }

  return { catalog }
}
