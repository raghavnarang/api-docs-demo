/**
 * Domain models exposed by the DAL. These are data-source-agnostic — the app
 * consumes these shapes regardless of whether the backing source is REST,
 * GraphQL, localStorage, or local JSON.
 */

import type { EndpointDef } from '../spec-parser'

/** Lightweight catalogue entry — drives the sidebar/catalogue list. */
export interface ApiSummary {
  id: string
  name: string
  version: string
  baseUrl: string
  description?: string
}

/** SDK / library link for an API, loaded from config (not hardcoded in JSX). */
export interface SdkLink {
  lang: string
  install: string
  repo: string
}

/** Full per-API metadata (catalogue entry + SDK links). */
export interface ApiDetail extends ApiSummary {
  sdks: SdkLink[]
}

/** One entry in an API's error reference catalogue. */
export interface ErrorRefEntry {
  /** App-level or HTTP code, e.g. "RATE_LIMITED" or "404". */
  code: string
  httpStatus?: number
  title: string
  description: string
  resolution?: string
}

/** A search hit: which API + which endpoint matched. */
export interface EndpointSearchResult {
  apiId: string
  apiName: string
  endpoint: EndpointDef
}
