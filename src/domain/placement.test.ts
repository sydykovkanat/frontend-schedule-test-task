import { describe, expect, it } from 'vitest'

import { evaluatePlacement, evaluateWeek } from '@/domain/placement'
import { slotKey } from '@/domain/keys'
import type { Placement, PlacementStatus } from '@/domain/types'
import { DATASET, ctx, lesson } from '@/test/fixtures'

const tally = (week: Map<string, Placement>) => {
  const counts: Record<PlacementStatus, number> = { valid: 0, warning: 0, blocked: 0 }
  for (const placement of week.values()) counts[placement.status] += 1
  return counts
}

describe('evaluatePlacement', () => {
  it('свободный слот проходит без замечаний', () => {
    const placement = evaluatePlacement('SEC_ENG110_01', { day: 'FRI', timeSlotId: 'SLOT_1600' }, ctx())

    expect(placement.status).toBe('valid')
    expect(placement.conflicts).toEqual([])
    expect(placement.assignment).not.toBeNull()
  })

  it('предупреждение не мешает выдать подбор', () => {
    const placement = evaluatePlacement('SEC_CS101_01', { day: 'FRI', timeSlotId: 'SLOT_1000' }, ctx())

    expect(placement.status).toBe('warning')
    expect(placement.conflicts.map((conflict) => conflict.code)).toContain('ROOM_TYPE')
    expect(placement.assignment?.roomId).toBe('R102')
  })

  it('ошибка блокирует размещение', () => {
    const placement = evaluatePlacement('SEC_CS101_01', { day: 'MON', timeSlotId: 'SLOT_0830' }, ctx())

    expect(placement.status).toBe('blocked')
    expect(placement.conflicts[0].code).toBe('SECTION_BUSY')
  })

  it('несостоявшийся подбор блокирует размещение и не даёт assignment', () => {
    const lessons = [
      lesson({ id: 'A', sectionId: 'SEC_CS101_02', teacherId: 'T2', roomId: 'R301', day: 'FRI', timeSlotId: 'SLOT_1600' }),
      lesson({ id: 'B', sectionId: 'SEC_PHY150_01', teacherId: 'T6', roomId: 'HALL1', day: 'FRI', timeSlotId: 'SLOT_1600' }),
    ]

    const placement = evaluatePlacement('SEC_HIS120_01', { day: 'FRI', timeSlotId: 'SLOT_1600' }, ctx(lessons))

    expect(placement.status).toBe('blocked')
    expect(placement.assignment).toBeNull()
    expect(placement.conflicts[0].code).toBe('NO_FREE_ROOM')
  })
})

describe('evaluateWeek', () => {
  it('покрывает все тридцать ячеек недели', () => {
    const week = evaluateWeek('SEC_ENG110_01', ctx())

    expect(week.size).toBe(DATASET.meta.weekDays.length * DATASET.timeSlots.length)
    expect(week.size).toBe(30)
    expect(week.has(slotKey('MON', 'SLOT_0830'))).toBe(true)
  })

  it('у CS101-01 нет ни одного безупречного слота из-за нехватки лабораторий', () => {
    expect(tally(evaluateWeek('SEC_CS101_01', ctx()))).toEqual({ valid: 0, warning: 26, blocked: 4 })
  })

  it('секция без преподавателя распределяется почти всюду', () => {
    expect(tally(evaluateWeek('SEC_AI310_01', ctx()))).toEqual({ valid: 28, warning: 2, blocked: 0 })
  })

  it('блокировки преподавателя видны в раскладе недели', () => {
    expect(tally(evaluateWeek('SEC_MATH201_01', ctx()))).toEqual({ valid: 26, warning: 0, blocked: 4 })
  })

  it('крупная секция ограничена вместимостью аудиторий', () => {
    expect(tally(evaluateWeek('SEC_HIS120_01', ctx()))).toEqual({ valid: 27, warning: 0, blocked: 3 })
  })

  it('при переносе занятие не мешает самому себе', () => {
    const week = evaluateWeek('SEC_CS101_01', ctx(undefined, 'L1'))

    expect(week.get(slotKey('MON', 'SLOT_0830'))?.status).not.toBe('blocked')
  })
})
