/**
 * OpenAPI 3.x → typed domain model. Implemented when the docs feature lands;
 * signature stubbed now so consumers can be wired against it.
 */

export interface EndpointDef {
  method: string
  path: string
  summary?: string
}

export function parseOpenApiSpec(_spec: unknown): EndpointDef[] {
  throw new Error('parseOpenApiSpec is not implemented yet')
}
