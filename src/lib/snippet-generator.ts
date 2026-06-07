import type { SandboxRequest } from './sandbox/rest-client'

/**
 * Generates cURL / JavaScript (fetch) / Python (requests) snippets from an
 * assembled `SandboxRequest` — the exact request the sandbox fires, so a copied
 * snippet reproduces the live call. Each generator serialises the body in its
 * language's native form (JSON for cURL/fetch, a dict literal for requests).
 */

export type SnippetLang = 'curl' | 'javascript' | 'python'

const INDENT = '  '

function hasBody(req: SandboxRequest): boolean {
  return req.body !== undefined && req.body !== null
}

/** Escape a string for safe embedding inside single quotes in a shell command. */
function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

function curlSnippet(req: SandboxRequest): string {
  const lines = [`curl -X ${req.method} ${shellQuote(req.url)}`]
  for (const [key, value] of Object.entries(req.headers ?? {})) {
    lines.push(`${INDENT}-H ${shellQuote(`${key}: ${value}`)}`)
  }
  if (hasBody(req)) {
    lines.push(`${INDENT}-d ${shellQuote(JSON.stringify(req.body))}`)
  }
  return lines.join(' \\\n')
}

function javascriptSnippet(req: SandboxRequest): string {
  const init: string[] = [`${INDENT}method: ${JSON.stringify(req.method)},`]
  if (req.headers) {
    init.push(`${INDENT}headers: ${indentJson(req.headers, 1)},`)
  }
  if (hasBody(req)) {
    init.push(`${INDENT}body: JSON.stringify(${indentJson(req.body, 1)}),`)
  }
  return [
    `const response = await fetch(${JSON.stringify(req.url)}, {`,
    init.join('\n'),
    `})`,
    `const data = await response.json()`,
  ].join('\n')
}

/** Render a value as a Python literal (dict/list/str/num/bool/None). */
function toPython(value: unknown, depth = 1): string {
  const pad = INDENT.repeat(depth)
  const padEnd = INDENT.repeat(depth - 1)
  if (value === null || value === undefined) return 'None'
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return JSON.stringify(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((v) => `${pad}${toPython(v, depth + 1)}`)
    return `[\n${items.join(',\n')}\n${padEnd}]`
  }
  const entries = Object.entries(value as Record<string, unknown>)
  if (entries.length === 0) return '{}'
  const rows = entries.map(
    ([k, v]) => `${pad}${JSON.stringify(k)}: ${toPython(v, depth + 1)}`,
  )
  return `{\n${rows.join(',\n')}\n${padEnd}}`
}

function pythonSnippet(req: SandboxRequest): string {
  const args = [`${INDENT}${JSON.stringify(req.method)}`, `${INDENT}${JSON.stringify(req.url)}`]
  // The dict value sits after `  headers=` (depth 1), so its body starts at
  // depth 2 and its closing brace aligns back to depth 1.
  if (req.headers) args.push(`${INDENT}headers=${toPython(req.headers, 2)}`)
  if (hasBody(req)) args.push(`${INDENT}json=${toPython(req.body, 2)}`)
  return [
    'import requests',
    '',
    'response = requests.request(',
    args.join(',\n') + ',',
    ')',
    'print(response.json())',
  ].join('\n')
}

/** JSON.stringify with 2-space indent, re-indented to sit at `depth` levels. */
function indentJson(value: unknown, depth: number): string {
  const json = JSON.stringify(value, null, 2)
  const pad = INDENT.repeat(depth)
  return json.replace(/\n/g, `\n${pad}`)
}

export function generateSnippet(req: SandboxRequest, lang: SnippetLang): string {
  switch (lang) {
    case 'curl':
      return curlSnippet(req)
    case 'javascript':
      return javascriptSnippet(req)
    case 'python':
      return pythonSnippet(req)
  }
}
