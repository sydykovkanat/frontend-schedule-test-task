import { describe, expect, it } from 'vitest'

import { plural, withCount } from './plural'

const SECTION = ['секция', 'секции', 'секций'] as const

describe('plural', () => {
  it('берёт единственную форму для чисел, оканчивающихся на 1', () => {
    expect(plural(1, SECTION)).toBe('секция')
    expect(plural(21, SECTION)).toBe('секция')
    expect(plural(101, SECTION)).toBe('секция')
  })

  it('берёт форму родительного единственного для чисел, оканчивающихся на 2-4', () => {
    expect(plural(2, SECTION)).toBe('секции')
    expect(plural(4, SECTION)).toBe('секции')
    expect(plural(23, SECTION)).toBe('секции')
  })

  it('берёт форму множественного для остальных чисел', () => {
    expect(plural(0, SECTION)).toBe('секций')
    expect(plural(5, SECTION)).toBe('секций')
    expect(plural(10, SECTION)).toBe('секций')
    expect(plural(100, SECTION)).toBe('секций')
  })

  it('обрабатывает исключение второго десятка', () => {
    expect(plural(11, SECTION)).toBe('секций')
    expect(plural(12, SECTION)).toBe('секций')
    expect(plural(14, SECTION)).toBe('секций')
    expect(plural(111, SECTION)).toBe('секций')
    expect(plural(112, SECTION)).toBe('секций')
  })

  it('withCount склеивает число с нужной формой', () => {
    expect(withCount(1, SECTION)).toBe('1 секция')
    expect(withCount(3, SECTION)).toBe('3 секции')
    expect(withCount(12, SECTION)).toBe('12 секций')
  })
})
