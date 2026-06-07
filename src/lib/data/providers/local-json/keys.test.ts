import { beforeEach, describe, expect, test } from 'vitest'
import { createLocalJsonDataSource } from './index'

const TOKEN_A = 'user-a-token'
const TOKEN_B = 'user-b-token'

describe('local-json ApiKeyRepository', () => {
  const { keys } = createLocalJsonDataSource()

  beforeEach(() => localStorage.clear())

  test('create → list round-trips with masked value and metadata', async () => {
    const created = await keys.createKey(TOKEN_A, {
      name: 'CI key',
      environment: 'sandbox',
    })
    expect(created.name).toBe('CI key')
    expect(created.status).toBe('active')
    expect(created.lastUsedAt).toBeNull()
    expect(created.maskedKey).toMatch(/^sk_sandbox_••••••••.{4}$/)

    const list = await keys.listKeys(TOKEN_A)
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(created.id)
  })

  test('production keys use the live secret prefix', async () => {
    const created = await keys.createKey(TOKEN_A, {
      name: 'prod',
      environment: 'production',
    })
    expect(created.secret.startsWith('sk_live_')).toBe(true)
    expect(created.maskedKey.startsWith('sk_live_')).toBe(true)
  })

  test('the full secret is returned once and never persisted', async () => {
    const created = await keys.createKey(TOKEN_A, {
      name: 'secret',
      environment: 'sandbox',
    })
    // The plaintext must not appear anywhere in storage.
    expect(JSON.stringify(localStorage)).not.toContain(created.secret)
    const [stored] = await keys.listKeys(TOKEN_A)
    expect('secret' in stored).toBe(false)
    expect(stored.maskedKey).not.toBe(created.secret)
  })

  test('only the last 4 chars of the secret survive in the mask', async () => {
    const created = await keys.createKey(TOKEN_A, {
      name: 'mask',
      environment: 'sandbox',
    })
    const last4 = created.secret.slice(-4)
    expect(created.maskedKey.endsWith(last4)).toBe(true)
  })

  test('revoke flips status and keeps the key in the list', async () => {
    const created = await keys.createKey(TOKEN_A, {
      name: 'to revoke',
      environment: 'sandbox',
    })
    await keys.revokeKey(TOKEN_A, created.id)
    const list = await keys.listKeys(TOKEN_A)
    expect(list).toHaveLength(1)
    expect(list[0].status).toBe('revoked')
  })

  test('keys are isolated per owner (token)', async () => {
    await keys.createKey(TOKEN_A, { name: 'a', environment: 'sandbox' })
    expect(await keys.listKeys(TOKEN_B)).toEqual([])
    expect(await keys.listKeys(TOKEN_A)).toHaveLength(1)
  })

  test('expiry is stored when provided, null otherwise', async () => {
    const withExpiry = await keys.createKey(TOKEN_A, {
      name: 'temp',
      environment: 'sandbox',
      expiresAt: '2999-01-01T00:00:00.000Z',
    })
    expect(withExpiry.expiresAt).toBe('2999-01-01T00:00:00.000Z')

    const noExpiry = await keys.createKey(TOKEN_A, {
      name: 'forever',
      environment: 'sandbox',
    })
    expect(noExpiry.expiresAt).toBeNull()
  })
})
