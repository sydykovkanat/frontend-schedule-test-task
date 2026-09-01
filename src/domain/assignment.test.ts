import { describe, expect, it } from 'vitest'

import { resolveAssignment } from '@/domain/assignment'
import type { SlotRef } from '@/domain/types'
import { ctx, lesson } from '@/test/fixtures'

const FREE_SLOT: SlotRef = { day: 'FRI', timeSlotId: 'SLOT_1600' }

describe('resolveAssignment', () => {
  it('берёт назначенного секции преподавателя и помечает выбор как ручной', () => {
    const result = resolveAssignment('SEC_ENG110_01', FREE_SLOT, ctx())

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.assignment.teacherId).toBe('T5')
    expect(result.assignment.teacherAuto).toBe(false)
  })

  it('подбирает преподавателя секции, у которой он не назначен', () => {
    const result = resolveAssignment('SEC_AI310_01', { day: 'MON', timeSlotId: 'SLOT_1130' }, ctx())

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(['T1', 'T4']).toContain(result.assignment.teacherId)
    expect(result.assignment.teacherAuto).toBe(true)
  })

  it('пропускает занятого преподавателя при подборе', () => {
    const lessons = [lesson({ id: 'A', sectionId: 'SEC_CS205_01', teacherId: 'T1', day: 'MON', timeSlotId: 'SLOT_1130' })]

    const result = resolveAssignment('SEC_AI310_01', { day: 'MON', timeSlotId: 'SLOT_1130' }, ctx(lessons))

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.assignment.teacherId).toBe('T4')
  })

  it('сообщает, когда все допустимые преподаватели заняты', () => {
    const lessons = [
      lesson({ id: 'A', sectionId: 'SEC_CS205_01', teacherId: 'T1', roomId: 'R101', day: 'MON', timeSlotId: 'SLOT_1130' }),
      lesson({ id: 'B', sectionId: 'SEC_DB202_01', teacherId: 'T4', roomId: 'R102', day: 'MON', timeSlotId: 'SLOT_1130' }),
    ]

    const result = resolveAssignment('SEC_AI310_01', { day: 'MON', timeSlotId: 'SLOT_1130' }, ctx(lessons))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.conflict.code).toBe('NO_FREE_TEACHER')
    expect(result.conflict.level).toBe('error')
  })

  it('учитывает блокировку преподавателя при подборе', () => {
    const result = resolveAssignment('SEC_AI310_01', { day: 'FRI', timeSlotId: 'SLOT_1600' }, ctx())

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.assignment.teacherId).toBe('T4')
  })

  it('предпочитает аудиторию нужного типа', () => {
    const result = resolveAssignment('SEC_AI310_01', { day: 'MON', timeSlotId: 'SLOT_1130' }, ctx())

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.assignment.roomId).toBe('LAB1')
    expect(result.assignment.roomAuto).toBe(true)
  })

  it('берёт самую тесную из вмещающих аудиторий', () => {
    const result = resolveAssignment('SEC_HIS120_01', FREE_SLOT, ctx())

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.assignment.roomId).toBe('R301')
  })

  it('отступает от предпочитаемого типа, если он не вмещает секцию', () => {
    const result = resolveAssignment('SEC_CS101_01', FREE_SLOT, ctx())

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.assignment.roomId).toBe('R102')
  })

  it('сообщает, когда свободной аудитории нужного размера нет', () => {
    const lessons = [
      lesson({ id: 'A', sectionId: 'SEC_CS101_02', teacherId: 'T2', roomId: 'R301', day: 'FRI', timeSlotId: 'SLOT_1600' }),
      lesson({ id: 'B', sectionId: 'SEC_PHY150_01', teacherId: 'T6', roomId: 'HALL1', day: 'FRI', timeSlotId: 'SLOT_1600' }),
    ]

    const result = resolveAssignment('SEC_HIS120_01', FREE_SLOT, ctx(lessons))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.conflict.code).toBe('NO_FREE_ROOM')
  })

  it('не переопределяет то, что пользователь выбрал руками', () => {
    const result = resolveAssignment('SEC_AI310_01', { day: 'MON', timeSlotId: 'SLOT_1130' }, ctx(), {
      teacherId: 'T4',
      roomId: 'HALL1',
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.assignment).toEqual({
      teacherId: 'T4',
      roomId: 'HALL1',
      teacherAuto: false,
      roomAuto: false,
    })
  })

  it('не считает переносимое занятие помехой самому себе', () => {
    const result = resolveAssignment('SEC_CS101_01', { day: 'MON', timeSlotId: 'SLOT_0830' }, ctx(undefined, 'L1'), {
      roomId: 'R201',
    })

    expect(result.ok).toBe(true)
  })
})
