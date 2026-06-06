import { describe, test, expect } from 'vitest'
import { credentialsSchema, fieldErrors } from './validation'

describe('credentialsSchema', () => {
  test('accepts a valid email + password', () => {
    const result = credentialsSchema.safeParse({
      email: 'dev@example.com',
      password: 'password1',
    })
    expect(result.success).toBe(true)
  })

  test('rejects an invalid email', () => {
    const result = credentialsSchema.safeParse({ email: 'nope', password: 'password1' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(fieldErrors(result.error).email).toBe('Enter a valid email')
    }
  })

  test('rejects a short password', () => {
    const result = credentialsSchema.safeParse({ email: 'a@b.com', password: 'short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(fieldErrors(result.error).password).toMatch(/at least 8/)
    }
  })

  test('fieldErrors keeps the first message per field', () => {
    const result = credentialsSchema.safeParse({ email: '', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errs = fieldErrors(result.error)
      expect(errs.email).toBeDefined()
      expect(errs.password).toBeDefined()
    }
  })
})
