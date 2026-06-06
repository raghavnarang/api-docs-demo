import { describe, expect, test } from 'vitest'
import { methodColor, statusColor } from './conventions'

describe('methodColor', () => {
  test('maps verbs to the right colour family (case-insensitive)', () => {
    expect(methodColor('get')).toContain('blue')
    expect(methodColor('GET')).toContain('blue')
    expect(methodColor('post')).toContain('green')
    expect(methodColor('put')).toContain('amber')
    expect(methodColor('patch')).toContain('amber')
    expect(methodColor('delete')).toContain('red')
    expect(methodColor('trace')).toContain('slate')
  })
})

describe('statusColor', () => {
  test('maps status classes by first digit', () => {
    expect(statusColor('200')).toContain('green')
    expect(statusColor(204)).toContain('green')
    expect(statusColor('301')).toContain('blue')
    expect(statusColor('404')).toContain('amber')
    expect(statusColor('500')).toContain('red')
  })

  test('non-numeric (e.g. "default") falls back to slate', () => {
    expect(statusColor('default')).toContain('slate')
    expect(statusColor('1xx')).toContain('slate')
  })
})
