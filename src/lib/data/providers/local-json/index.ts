import { API_REGISTRY, type ApiDefinition } from '../../../../apis/api-registry'
import type { DataSource } from '../../data-source'
import type {
  ApiCatalogRepository,
  ApiKeyRepository,
  ApiStatusRepository,
  UsageAnalyticsRepository,
} from '../../repositories'
import * as analyticsStore from './analytics-store'
import * as keysStore from './keys-store'
import { resolveOwner } from './owner'
import { specMatchesQuery } from './search'
import * as statusStore from './status-store'

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
    async getChangelog(id) {
      return find(id)?.changelog ?? []
    },
    async searchApis(query) {
      const q = query.trim().toLowerCase()
      if (!q) return []
      return registry
        .filter(({ spec }) => specMatchesQuery(spec, q))
        .map(({ id, name }) => ({ apiId: id, apiName: name }))
    },
  }

  const keys: ApiKeyRepository = {
    async listKeys(token) {
      return keysStore.listKeys(resolveOwner(token))
    },
    async createKey(token, input) {
      return keysStore.createKey(resolveOwner(token), input)
    },
    async revokeKey(token, id) {
      keysStore.revokeKey(resolveOwner(token), id)
    },
  }

  const analyticsEndpoints = analyticsStore.extractEndpoints(registry)
  const analytics: UsageAnalyticsRepository = {
    async getKeyUsage(token, keyId, window) {
      return analyticsStore.getKeyUsage(
        resolveOwner(token),
        keyId,
        window,
        analyticsEndpoints,
      )
    },
  }

  const status: ApiStatusRepository = {
    async getApiStatus(apiId) {
      return statusStore.getApiStatus(apiId, registry)
    },
    async getStatusBanner() {
      return statusStore.getStatusBanner(registry)
    },
  }

  return { catalog, keys, analytics, status }
}
