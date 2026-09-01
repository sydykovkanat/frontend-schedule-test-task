import { describe, expect, it } from 'vitest'

import { buildProgressMap, summarizeWeek } from '@/domain/progress'
import { DATASET, lesson } from '@/test/fixtures'

describe('buildProgressMap', () => {
  it('считает распределённые занятия каждой секции', () => {
    const progress = buildProgressMap(DATASET.lessons, DATASET.sections)

    expect(progress.get('SEC_CS101_01')).toEqual({ placed: 2, required: 3, status: 'partial' })
    expect(progress.get('SEC_MATH201_01')).toEqual({ placed: 1, required: 2, status: 'partial' })
  })

  it('секция без занятий помечена как нераспределённая', () => {
    expect(buildProgressMap(DATASET.lessons, DATASET.sections).get('SEC_AI310_01')).toEqual({
      placed: 0,
      required: 2,
      status: 'unassigned',
    })
  })

  it('набранная норма даёт статус complete', () => {
    const lessons = [
      ...DATASET.lessons,
      lesson({ id: 'X', sectionId: 'SEC_MATH201_01', teacherId: 'T3', day: 'WED', timeSlotId: 'SLOT_1600' }),
    ]

    expect(buildProgressMap(lessons, DATASET.sections).get('SEC_MATH201_01')?.status).toBe('complete')
  })

  it('перебор нормы тоже считается complete', () => {
    const lessons = [
      ...DATASET.lessons,
      lesson({ id: 'X', sectionId: 'SEC_MATH201_01', day: 'WED', timeSlotId: 'SLOT_1600' }),
      lesson({ id: 'Y', sectionId: 'SEC_MATH201_01', day: 'THU', timeSlotId: 'SLOT_1600' }),
    ]

    const progress = buildProgressMap(lessons, DATASET.sections).get('SEC_MATH201_01')

    expect(progress).toEqual({ placed: 3, required: 2, status: 'complete' })
  })

  it('в карте есть запись для каждой секции набора', () => {
    expect(buildProgressMap([], DATASET.sections).size).toBe(DATASET.sections.length)
  })
})

describe('summarizeWeek', () => {
  it('сводит прогресс по всем секциям в один счётчик', () => {
    const summary = summarizeWeek(DATASET.lessons, DATASET.sections)

    expect(summary.placed).toBe(10)
    expect(summary.required).toBe(23)
    expect(summary.completeSections).toBe(0)
    expect(summary.unassignedSections).toBe(1)
  })
})
