/**
 * Domain models exposed by the DAL. These are data-source-agnostic — the app
 * consumes these shapes regardless of whether the backing source is REST,
 * GraphQL, localStorage, or local JSON. Expand as features land.
 */

export interface ApiSummary {
  id: string
  name: string
  version: string
}
