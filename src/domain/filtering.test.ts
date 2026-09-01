import { describe, expect, it } from 'vitest'

import { NO_FILTERS, filterSections } from '@/domain/filtering'
import { buildProgressMap } from '@/domain/progress'
import type { SectionFilters } from '@/domain/filtering'
import { DATASET, INDEX } from '@/test/fixtures'

const deps = (lessons = DATASET.lessons) => ({
  index: INDEX,
  lessons,
  progress: buildProgressMap(lessons, DATASET.sections),
})

const codes = (filters: Partial<SectionFilters>) =>
  filterSections(DATASET.sections, { ...NO_FILTERS, ...filters }, deps()).map((section) => section.code)

describe('filterSections', () => {
  it('без фильтров возвращает все секции в исходном порядке', () => {
    expect(codes({})).toEqual(DATASET.sections.map((section) => section.code))
  })

  it('ищет по коду секции без учёта регистра', () => {
    expect(codes({ query: 'cs101' })).toEqual(['CS101-01', 'CS101-02'])
  })

  it('ищет по названию предмета', () => {
    expect(codes({ query: 'базы данных' })).toEqual(['DB202-01'])
  })

  it('ищет по имени преподавателя', () => {
    expect(codes({ query: 'садыков' })).toEqual(['MATH201-01', 'MATH101-02'])
  })

  it('игнорирует пробелы по краям запроса', () => {
    expect(codes({ query: '  AI310  ' })).toEqual(['AI310-01'])
  })

  it('возвращает пустой список, когда ничего не найдено', () => {
    expect(codes({ query: 'квантовая механика' })).toEqual([])
  })

  it('фильтрует по преподавателю, включая допустимых', () => {
    expect(codes({ teacherId: 'T4' })).toEqual(['DB202-01', 'CS205-01', 'AI310-01'])
  })

  it('фильтрует по аудитории, где секция уже стоит', () => {
    expect(codes({ roomId: 'LAB1' })).toEqual(['DB202-01', 'CS205-01'])
  })

  it('фильтрует по статусу распределения', () => {
    expect(codes({ status: 'unassigned' })).toEqual(['AI310-01'])
  })

  it('совмещает несколько фильтров', () => {
    expect(codes({ query: 'cs', teacherId: 'T1' })).toEqual(['CS101-01', 'CS101-02', 'CS205-01'])
  })
})
