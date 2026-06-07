import type {
  ApiKey,
  ApiKeyEnvironment,
  CreateApiKeyInput,
  CreatedApiKey,
} from '../../types'

/**
 * localStorage-backed API key store for the local-json adapter. Pure of React —
 * the adapter calls these after resolving the owner from the token. Each owner
 * gets its own bucket so accounts never see each other's keys, and data persists
 * across reloads/sessions exactly like a real backend would.
 *
 * Security model mirrors production: the full secret is generated, returned once,
 * and NEVER written to storage — only a `maskedKey` (prefix + last-4) is kept.
 */

const KEY_PREFIX = 'devportal:apikeys:'
const SECRET_BYTES = 24

function storageKey(owner: string): string {
  return `${KEY_PREFIX}${owner}`
}

function read(owner: string): ApiKey[] {
  const raw = localStorage.getItem(storageKey(owner))
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ApiKey[]) : []
  } catch {
    return []
  }
}

function write(owner: string, keys: ApiKey[]): void {
  localStorage.setItem(storageKey(owner), JSON.stringify(keys))
}

/** `sk_sandbox_` for sandbox, `sk_live_` for production (industry convention). */
function secretPrefix(environment: ApiKeyEnvironment): string {
  return environment === 'production' ? 'sk_live_' : 'sk_sandbox_'
}

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Mask a secret for storage/display: keep the prefix and last 4 chars only. */
function maskSecret(secret: string, environment: ApiKeyEnvironment): string {
  const prefix = secretPrefix(environment)
  const body = secret.slice(prefix.length)
  return `${prefix}••••••••${body.slice(-4)}`
}

export function listKeys(owner: string): ApiKey[] {
  return read(owner)
}

export function createKey(
  owner: string,
  input: CreateApiKeyInput,
): CreatedApiKey {
  const secret = `${secretPrefix(input.environment)}${randomHex(SECRET_BYTES)}`
  const key: ApiKey = {
    id: crypto.randomUUID(),
    name: input.name,
    environment: input.environment,
    maskedKey: maskSecret(secret, input.environment),
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    expiresAt: input.expiresAt ?? null,
    status: 'active',
  }
  write(owner, [key, ...read(owner)])
  // Plaintext secret returned once; only the masked form was persisted above.
  return { ...key, secret }
}

export function revokeKey(owner: string, id: string): void {
  write(
    owner,
    read(owner).map((key) =>
      key.id === id ? { ...key, status: 'revoked' } : key,
    ),
  )
}
