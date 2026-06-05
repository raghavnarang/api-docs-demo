/**
 * Single source of truth for registered APIs.
 *
 * To add an API: drop an `openapi.json` under `src/apis/<api-name>/` and add a
 * single entry to `API_REGISTRY` below. No component code should change — the
 * docs engine, sandbox, changelog, and status page all read from this registry.
 */

export interface SdkLink {
  lang: string
  install: string
  repo: string
}

export interface ApiDefinition {
  /** Unique slug, e.g. "pokeapi". */
  id: string
  /** Display name. */
  name: string
  /** Semver, e.g. "2.0.0". */
  version: string
  /** Sandbox base URL. */
  baseUrl: string
  // spec, docsFile, changelog, sdks added as features land.
}

export const API_REGISTRY: ApiDefinition[] = []
