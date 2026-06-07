import { describe, expect, test } from 'vitest'
import { createKeySchema } from './validation'

const future = '2999-01-01'
const past = '2000-01-01'

describe('createKeySchema', () => {
  test('accepts a valid key with no expiry', () => {
    const result = createKeySchema.safeParse({
      name: 'My key',
      environment: 'sandbox',
      expiresAt: '',
    })
    expect(result.success).toBe(true)
  })

  test('rejects an empty name', () => {
    const result = createKeySchema.safeParse({
      name: '   ',
      environment: 'sandbox',
    })
    expect(result.success).toBe(false)
  })

  test('rejects a name longer than 40 chars', () => {
    const result = createKeySchema.safeParse({
      name: 'x'.repeat(41),
      environment: 'sandbox',
    })
    expect(result.success).toBe(false)
  })

  test('rejects an unknown environment', () => {
    const result = createKeySchema.safeParse({
      name: 'ok',
      environment: 'staging',
    })
    expect(result.success).toBe(false)
  })

  test('accepts a future expiry, rejects a past one', () => {
    expect(
      createKeySchema.safeParse({
        name: 'ok',
        environment: 'sandbox',
        expiresAt: future,
      }).success,
    ).toBe(true)
    expect(
      createKeySchema.safeParse({
        name: 'ok',
        environment: 'sandbox',
        expiresAt: past,
      }).success,
    ).toBe(false)
  })
})
