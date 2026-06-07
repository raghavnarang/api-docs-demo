import type { OpenAPIV3 } from 'openapi-types'
import type { ChangelogEntry, ErrorRefEntry, SdkLink } from '../lib/data/types'

/**
 * Single source of truth for registered APIs.
 *
 * To add an API: drop an `openapi.json` under `src/apis/<api-name>/`, import it
 * here, and add one entry to `API_REGISTRY`. Optionally colocate `docs.md`
 * (import with `?raw`), an `errors.json`, a `changelog.json`, and SDK links. No
 * component code changes — the portal reads everything from this registry via
 * the DAL's `local-json` adapter.
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
  /** Versioned changelog entries (§2.7), authored newest-first. */
  changelog?: ChangelogEntry[]
}

import pokeapiSpec from './pokeapi/openapi.json'
import tcgdexSpec from './tcgdex/openapi.json'
import stubPaymentsSpec from './stub-payments/openapi.json'

import pokeapiDocs from './pokeapi/docs.md?raw'
import tcgdexDocs from './tcgdex/docs.md?raw'
import stubPaymentsDocs from './stub-payments/docs.md?raw'

import pokeapiErrors from './pokeapi/errors.json'
import tcgdexErrors from './tcgdex/errors.json'
import stubPaymentsErrors from './stub-payments/errors.json'

import pokeapiChangelog from './pokeapi/changelog.json'
import tcgdexChangelog from './tcgdex/changelog.json'
import stubPaymentsChangelog from './stub-payments/changelog.json'

// JSON imports are structurally typed; assert the domain shapes once at the boundary.
const asSpec = (spec: unknown) => spec as OpenAPIV3.Document
const asErrors = (errors: unknown) => errors as ErrorRefEntry[]
const asChangelog = (entries: unknown) => entries as ChangelogEntry[]

export const API_REGISTRY: ApiDefinition[] = [
  {
    id: 'pokeapi',
    name: 'PokéAPI',
    version: '2.0.0',
    baseUrl: 'https://pokeapi.co',
    description:
      'The free, open RESTful API for Pokémon data — species, types, abilities and more.',
    spec: asSpec(pokeapiSpec),
    docs: pokeapiDocs,
    errorReference: asErrors(pokeapiErrors),
    changelog: asChangelog(pokeapiChangelog),
    sdks: [
      {
        lang: 'JavaScript',
        install: 'npm install pokenode-ts',
        repo: 'https://github.com/Gabb-c/pokenode-ts',
      },
      {
        lang: 'Python',
        install: 'pip install pokebase',
        repo: 'https://github.com/PokeAPI/pokebase',
      },
    ],
  },
  {
    id: 'tcgdex',
    name: 'TCGdex',
    version: '2.0.0',
    baseUrl: 'https://api.tcgdex.net/v2/en',
    description:
      'Open-source Pokémon Trading Card Game database — cards, sets and series.',
    spec: asSpec(tcgdexSpec),
    docs: tcgdexDocs,
    errorReference: asErrors(tcgdexErrors),
    changelog: asChangelog(tcgdexChangelog),
    sdks: [
      {
        lang: 'JavaScript',
        install: 'npm install @tcgdex/sdk',
        repo: 'https://github.com/tcgdex/javascript-sdk',
      },
    ],
  },
  {
    id: 'stub-payments',
    name: 'Stub Payments',
    version: '1.0.0',
    baseUrl: 'https://api.example-pay.test/v1',
    description:
      'A mock payments API demonstrating write methods, request bodies and oneOf composition.',
    spec: asSpec(stubPaymentsSpec),
    docs: stubPaymentsDocs,
    errorReference: asErrors(stubPaymentsErrors),
    changelog: asChangelog(stubPaymentsChangelog),
    sdks: [
      {
        lang: 'JavaScript',
        install: 'npm install @example-pay/node',
        repo: 'https://github.com/example-pay/node-sdk',
      },
      {
        lang: 'Python',
        install: 'pip install example-pay',
        repo: 'https://github.com/example-pay/python-sdk',
      },
    ],
  },
]
