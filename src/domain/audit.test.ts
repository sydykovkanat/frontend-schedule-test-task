import { describe, expect, it } from 'vitest'

import { auditLessons, worstLevel } from '@/domain/audit'
import type { Conflict } from '@/domain/types'
import { DATASET, ctx, lesson } from '@/test/fixtures'

const conflict = (level: Conflict['level']): Conflict => ({
  code: 'ROOM_BUSY',
  level,
  message: 'test',
})

describe('auditLessons', () => {
  it('исключает само занятие из проверки, иначе оно конфликтует с собой', () => {
    const audit = auditLessons(DATASET.lessons, (excludeLessonId) =>
      ctx(DATASET.lessons, excludeLessonId),
    )

    for (const entry of audit.values()) {
      expect(entry.map((item) => item.code)).not.toContain('SECTION_SAME_SLOT')
    }
  })

  it('не заводит записи для занятий без конфликтов', () => {
    const clean = [lesson({ id: 'L1', sectionId: 'SEC_MATH201_01', roomId: 'R201' })]
    const audit = auditLessons(clean, (excludeLessonId) => ctx(clean, excludeLessonId))

    expect(audit.has('L1')).toBe(false)
  })

  it('находит занятие, которое не помещается в аудиторию', () => {
    const tight = [lesson({ id: 'L1', sectionId: 'SEC_CS101_01', roomId: 'LAB1' })]
    const audit = auditLessons(tight, (excludeLessonId) => ctx(tight, excludeLessonId))

    expect((audit.get('L1') ?? []).map((item) => item.code)).toContain('ROOM_CAPACITY')
  })
})

describe('worstLevel', () => {
  it('ошибка перевешивает предупреждение', () => {
    expect(worstLevel([conflict('warning'), conflict('error')])).toBe('error')
  })

  it('без ошибок остаётся предупреждение', () => {
    expect(worstLevel([conflict('warning')])).toBe('warning')
  })

  it('пустой список конфликтов не имеет уровня', () => {
    expect(worstLevel([])).toBeNull()
  })
})
