import type { OpenAPIV3 } from 'openapi-types'
import type { ApiDefinition } from '../../../../apis/api-registry'
import type { DataSource } from '../../data-source'
import { createLocalJsonDataSource } from '../local-json'

/**
 * In-memory fixtures for dev/tests. Mock = the local-json adapter pointed at an
 * inline registry, so both share identical read/search logic.
 */

const mockSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: { title: 'Mock API', version: '1.0.0' },
  paths: {
    '/pets': {
      get: {
        summary: 'List pets',
        description: 'Returns all pets.',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Max items to return',
            schema: { type: 'integer' },
          },
        ],
        responses: { '200': { description: 'A list of pets' } },
      },
      post: {
        summary: 'Create a pet',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '201': { description: 'Pet created' } },
      },
    },
    '/pets/{id}': {
      get: {
        summary: 'Get a pet by id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Pet identifier',
            schema: { type: 'string' },
          },
        ],
        responses: { '200': { description: 'A pet' } },
      },
      delete: {
        summary: 'Delete a pet',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { '204': { description: 'Deleted' } },
      },
    },
  },
}

const mockRegistry: ApiDefinition[] = [
  {
    id: 'mock-api',
    name: 'Mock API',
    version: '1.0.0',
    baseUrl: 'https://example.com/api',
    description: 'In-memory fixture API for development and tests.',
    spec: mockSpec,
    docs: '# Mock API\n\nThis is fixture documentation.',
    sdks: [
      {
        lang: 'JavaScript',
        install: 'npm i mock-api',
        repo: 'https://example.com/sdk-js',
      },
    ],
    errorReference: [
      {
        code: 'NOT_FOUND',
        httpStatus: 404,
        title: 'Resource not found',
        description: 'The requested resource does not exist.',
        resolution: 'Verify the id and try again.',
      },
    ],
  },
]

export function createMockDataSource(): DataSource {
  return createLocalJsonDataSource(mockRegistry)
}
