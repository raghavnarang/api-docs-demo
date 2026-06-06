import type { OpenAPIV3 } from 'openapi-types'
import type { ErrorRefEntry, SdkLink } from '../lib/data/types'

/**
 * Single source of truth for registered APIs.
 *
 * To add an API: drop an `openapi.json` under `src/apis/<api-name>/`, import it
 * here, and add one entry to `API_REGISTRY`. Optionally colocate `docs.md`
 * (import with `?raw`), an `errors.json`, and SDK links. No component code
 * changes — the portal reads everything from this registry via the DAL's
 * `local-json` adapter.
 */

export interface ApiDefinition {
  /** Unique slug, e.g. "pokeapi". */
  id: string
  /** Display name. */
  name: string
  /** Semver, e.g. "2.0.0". */
  version: string
  /** Sandbox base URL (always REST). */
  baseUrl: string
  description?: string
  /** Imported OpenAPI 3.x document. */
  spec: OpenAPIV3.Document
  /** Getting Started guide (import the `.md` with Vite's `?raw`). */
  docs?: string
  /** SDK / library links. */
  sdks?: SdkLink[]
  /** Error reference catalogue. */
  errorReference?: ErrorRefEntry[]
}

import pokeapiSpec from './pokeapi/openapi.json'
import tcgdexSpec from './tcgdex/openapi.json'
import stubPaymentsSpec from './stub-payments/openapi.json'

// JSON imports are structurally typed; assert the OpenAPI shape once at the boundary.
const asSpec = (spec: unknown) => spec as OpenAPIV3.Document

export const API_REGISTRY: ApiDefinition[] = [
  {
    id: 'pokeapi',
    name: 'PokéAPI',
    version: '2.0.0',
    baseUrl: 'https://pokeapi.co',
    description:
      'The free, open RESTful API for Pokémon data — species, types, abilities and more.',
    spec: asSpec(pokeapiSpec),
  },
  {
    id: 'tcgdex',
    name: 'TCGdex',
    version: '2.0.0',
    baseUrl: 'https://api.tcgdex.net/v2/en',
    description:
      'Open-source Pokémon Trading Card Game database — cards, sets and series.',
    spec: asSpec(tcgdexSpec),
  },
  {
    id: 'stub-payments',
    name: 'Stub Payments',
    version: '1.0.0',
    baseUrl: 'https://api.example-pay.test/v1',
    description:
      'A mock payments API demonstrating write methods, request bodies and oneOf composition.',
    spec: asSpec(stubPaymentsSpec),
  },
]
