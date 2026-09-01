import { describe, expect, it } from 'vitest'

import { createScheduleState, scheduleReducer } from '@/state/scheduleReducer'
import { DATASET } from '@/test/fixtures'

const initial = () => createScheduleState(DATASET.lessons)

describe('scheduleReducer', () => {
  it('ставит занятие в слот', () => {
    const next = scheduleReducer(initial(), {
      type: 'place',
      sectionId: 'SEC_AI310_01',
      slot: { day: 'FRI', timeSlotId: 'SLOT_1600' },
      assignment: { teacherId: 'T4', roomId: 'LAB1' },
    })

    expect(next.lessons).toHaveLength(11)
    expect(next.lessons.at(-1)).toMatchObject({
      sectionId: 'SEC_AI310_01',
      teacherId: 'T4',
      roomId: 'LAB1',
      day: 'FRI',
      timeSlotId: 'SLOT_1600',
    })
  })

  it('выдаёт новым занятиям неповторяющиеся идентификаторы', () => {
    const place = {
      type: 'place',
      sectionId: 'SEC_AI310_01',
      slot: { day: 'FRI', timeSlotId: 'SLOT_1600' },
      assignment: { teacherId: 'T4', roomId: 'LAB1' },
    } as const

    const next = scheduleReducer(scheduleReducer(initial(), place), place)
    const ids = next.lessons.map((lesson) => lesson.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('не изменяет прежнее состояние', () => {
    const before = initial()
    const snapshot = [...before.lessons]

    scheduleReducer(before, {
      type: 'place',
      sectionId: 'SEC_AI310_01',
      slot: { day: 'FRI', timeSlotId: 'SLOT_1600' },
      assignment: { teacherId: 'T4', roomId: 'LAB1' },
    })

    expect(before.lessons).toEqual(snapshot)
  })

  it('переносит занятие в другой слот вместе с подбором', () => {
    const next = scheduleReducer(initial(), {
      type: 'move',
      lessonId: 'L1',
      slot: { day: 'THU', timeSlotId: 'SLOT_1600' },
      assignment: { teacherId: 'T1', roomId: 'R102' },
    })

    expect(next.lessons).toHaveLength(10)
    expect(next.lessons.find((lesson) => lesson.id === 'L1')).toMatchObject({
      day: 'THU',
      timeSlotId: 'SLOT_1600',
      roomId: 'R102',
    })
  })

  it('меняет преподавателя и аудиторию, не трогая слот', () => {
    const next = scheduleReducer(initial(), {
      type: 'reassign',
      lessonId: 'L1',
      teacherId: 'T2',
      roomId: 'R301',
    })

    expect(next.lessons.find((lesson) => lesson.id === 'L1')).toMatchObject({
      teacherId: 'T2',
      roomId: 'R301',
      day: 'MON',
      timeSlotId: 'SLOT_0830',
    })
  })

  it('убирает занятие из расписания', () => {
    const next = scheduleReducer(initial(), { type: 'remove', lessonId: 'L1' })

    expect(next.lessons).toHaveLength(9)
    expect(next.lessons.some((lesson) => lesson.id === 'L1')).toBe(false)
  })

  it('копирует занятие в другой слот', () => {
    const next = scheduleReducer(initial(), {
      type: 'duplicate',
      lessonId: 'L1',
      slot: { day: 'FRI', timeSlotId: 'SLOT_1600' },
      assignment: { teacherId: 'T1', roomId: 'R102' },
    })

    expect(next.lessons).toHaveLength(11)
    expect(next.lessons.some((lesson) => lesson.id === 'L1')).toBe(true)
    expect(next.lessons.at(-1)).toMatchObject({ sectionId: 'SEC_CS101_01', day: 'FRI', roomId: 'R102' })
  })

  it('оставляет состояние как есть, если занятия нет', () => {
    const before = initial()

    expect(scheduleReducer(before, { type: 'remove', lessonId: 'нет такого' })).toBe(before)
    expect(scheduleReducer(before, { type: 'reassign', lessonId: 'нет такого', teacherId: 'T1' })).toBe(before)
  })

  it('сбрасывает расписание к переданному набору', () => {
    const next = scheduleReducer(initial(), { type: 'reset', lessons: [] })

    expect(next.lessons).toEqual([])
  })
})
