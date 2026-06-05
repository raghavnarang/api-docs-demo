import type { SandboxRequest } from './sandbox/rest-client'

/**
 * Generates cURL / JavaScript (fetch) / Python (requests) snippets from the
 * current sandbox request state. Implemented when the sandbox feature lands.
 */

export type SnippetLang = 'curl' | 'javascript' | 'python'

export function generateSnippet(
  _req: SandboxRequest,
  _lang: SnippetLang,
): string {
  throw new Error('generateSnippet is not implemented yet')
}
