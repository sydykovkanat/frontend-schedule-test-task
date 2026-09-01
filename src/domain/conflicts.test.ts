import { describe, expect, it } from 'vitest'

import { ctx, lesson } from '@/test/fixtures'
import { findConflicts, type PlacementTarget } from '@/domain/conflicts'
import type { Conflict } from '@/domain/types'

const codes = (conflicts: Conflict[]) => conflicts.map((conflict) => conflict.code)

const target = (patch: Partial<PlacementTarget>): PlacementTarget => ({
  sectionId: 'SEC_CS101_01',
  day: 'MON',
  timeSlotId: 'SLOT_0830',
  teacherId: 'T1',
  roomId: 'R201',
  ...patch,
})

describe('findConflicts', () => {
  it('своё занятие в том же слоте заслоняет остальные причины', () => {
    const conflicts = findConflicts(target({}), ctx())

    expect(codes(conflicts)).toEqual(['SECTION_BUSY'])
    expect(conflicts[0].level).toBe('error')
  })

  it('преподаватель недоступен по teacherBlockedSlots', () => {
    const conflicts = findConflicts(
      target({ sectionId: 'SEC_MATH201_01', teacherId: 'T3', roomId: 'R301' }),
      ctx(),
    )

    expect(codes(conflicts)).toEqual(['TEACHER_BLOCKED'])
    expect(conflicts[0].message).toContain('Садыков')
  })

  it('в причине блокировки видна формулировка из данных', () => {
    const conflicts = findConflicts(
      target({ sectionId: 'SEC_PHY150_01', day: 'WED', timeSlotId: 'SLOT_1130', teacherId: 'T6', roomId: 'HALL1' }),
      ctx(),
    )

    expect(conflicts[0].message.toLowerCase()).toContain('недоступен')
  })

  it('преподаватель уже ведёт другое занятие в этом слоте', () => {
    const conflicts = findConflicts(
      target({ sectionId: 'SEC_CS205_01', teacherId: 'T1', roomId: 'R101' }),
      ctx(),
    )

    expect(codes(conflicts)).toContain('TEACHER_BUSY')
    expect(conflicts.find((conflict) => conflict.code === 'TEACHER_BUSY')?.message).toContain('CS101-01')
  })

  it('аудитория уже занята в этом слоте', () => {
    const conflicts = findConflicts(
      target({ sectionId: 'SEC_ENG110_01', teacherId: 'T5', roomId: 'R201' }),
      ctx(),
    )

    expect(codes(conflicts)).toEqual(['ROOM_BUSY'])
    expect(conflicts[0].message).toContain('B-201')
  })

  it('вместимость аудитории меньше числа студентов', () => {
    const conflicts = findConflicts(
      target({ sectionId: 'SEC_HIS120_01', teacherId: 'T5', roomId: 'LAB1' }),
      ctx(),
    )

    expect(codes(conflicts)).toContain('ROOM_CAPACITY')
    expect(conflicts.find((conflict) => conflict.code === 'ROOM_CAPACITY')?.message).toContain('38')
  })

  it('несовпадение типа аудитории — предупреждение, а не запрет', () => {
    const conflicts = findConflicts(
      target({ day: 'TUE', timeSlotId: 'SLOT_1130', roomId: 'R301' }),
      ctx(),
    )

    expect(codes(conflicts)).toEqual(['ROOM_TYPE'])
    expect(conflicts[0].level).toBe('warning')
  })

  it('набранная норма занятий — предупреждение', () => {
    const lessons = [
      lesson({ id: 'A', sectionId: 'SEC_MATH201_01', teacherId: 'T3', day: 'TUE', timeSlotId: 'SLOT_1130' }),
      lesson({ id: 'B', sectionId: 'SEC_MATH201_01', teacherId: 'T3', day: 'WED', timeSlotId: 'SLOT_1130' }),
    ]

    const conflicts = findConflicts(
      target({ sectionId: 'SEC_MATH201_01', day: 'THU', timeSlotId: 'SLOT_1600', teacherId: 'T3', roomId: 'R301' }),
      ctx(lessons),
    )

    expect(codes(conflicts)).toEqual(['QUOTA_FULL'])
    expect(conflicts[0].level).toBe('warning')
  })

  it('переносимое занятие не конфликтует само с собой', () => {
    const conflicts = findConflicts(target({}), ctx(undefined, 'L1'))

    expect(conflicts.filter((conflict) => conflict.level === 'error')).toEqual([])
  })

  it('свободный слот не даёт ни одного конфликта', () => {
    const conflicts = findConflicts(
      target({ sectionId: 'SEC_ENG110_01', day: 'FRI', timeSlotId: 'SLOT_1600', teacherId: 'T5', roomId: 'R102' }),
      ctx(),
    )

    expect(conflicts).toEqual([])
  })

  it('каждый конфликт несёт текст для пользователя', () => {
    const conflicts = findConflicts(
      target({ sectionId: 'SEC_HIS120_01', teacherId: 'T5', roomId: 'LAB1' }),
      ctx(),
    )

    expect(conflicts.length).toBeGreaterThan(0)
    for (const conflict of conflicts) {
      expect(conflict.message.length).toBeGreaterThan(0)
      expect(conflict.message).not.toContain('_')
    }
  })
})
