import { describe, expect, test } from 'vitest'
import { generateSnippet } from './snippet-generator'
import type { SandboxRequest } from './sandbox/rest-client'

const getReq: SandboxRequest = {
  method: 'GET',
  url: 'https://pokeapi.co/api/v2/pokemon/pikachu',
  headers: { Authorization: 'Bearer tok' },
}

const postReq: SandboxRequest = {
  method: 'POST',
  url: 'https://x.test/payments',
  headers: { 'Content-Type': 'application/json' },
  body: { amount: 100, live: true, note: null },
}

describe('generateSnippet — curl', () => {
  test('includes method, url and headers', () => {
    const snippet = generateSnippet(getReq, 'curl')
    expect(snippet).toContain(
      "curl -X GET 'https://pokeapi.co/api/v2/pokemon/pikachu'",
    )
    expect(snippet).toContain("-H 'Authorization: Bearer tok'")
    expect(snippet).not.toContain('-d')
  })

  test('adds -d with the JSON body for writes', () => {
    const snippet = generateSnippet(postReq, 'curl')
    expect(snippet).toContain('-d \'{"amount":100,"live":true,"note":null}\'')
  })
})

describe('generateSnippet — javascript', () => {
  test('produces a fetch call with method, headers and stringified body', () => {
    const snippet = generateSnippet(postReq, 'javascript')
    expect(snippet).toContain('fetch("https://x.test/payments"')
    expect(snippet).toContain('method: "POST"')
    expect(snippet).toContain('body: JSON.stringify(')
  })

  test('omits the body for GET', () => {
    expect(generateSnippet(getReq, 'javascript')).not.toContain('body:')
  })
})

describe('generateSnippet — python', () => {
  test('uses requests with a native dict body (True/None, not true/null)', () => {
    const snippet = generateSnippet(postReq, 'python')
    expect(snippet).toContain('import requests')
    expect(snippet).toContain('requests.request(')
    expect(snippet).toContain('"POST"')
    expect(snippet).toContain('json=')
    expect(snippet).toContain('True')
    expect(snippet).toContain('None')
    expect(snippet).not.toContain('true')
    expect(snippet).not.toContain('null')
  })

  test('indents nested dicts under their arg (body at 4, nested at 6)', () => {
    const req: SandboxRequest = {
      method: 'POST',
      url: 'https://x.test/payments',
      body: { amount: 0, card: { number: 0 } },
    }
    expect(generateSnippet(req, 'python')).toBe(
      [
        'import requests',
        '',
        'response = requests.request(',
        '  "POST",',
        '  "https://x.test/payments",',
        '  json={',
        '    "amount": 0,',
        '    "card": {',
        '      "number": 0',
        '    }',
        '  },',
        ')',
        'print(response.json())',
      ].join('\n'),
    )
  })
})
