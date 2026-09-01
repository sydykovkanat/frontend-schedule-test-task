import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import { ScheduleProvider } from '@/state/ScheduleProvider'
import { useSchedule } from '@/state/ScheduleContext'
import { DATASET } from '@/test/fixtures'

const wrapper = ({ children }: { children: ReactNode }) => (
  <ScheduleProvider dataset={DATASET}>{children}</ScheduleProvider>
)

const mount = () => renderHook(() => useSchedule(), { wrapper })

const place = {
  type: 'place',
  sectionId: 'SEC_AI310_01',
  slot: { day: 'FRI', timeSlotId: 'SLOT_1600' },
  assignment: { teacherId: 'T4', roomId: 'LAB1' },
} as const

beforeEach(() => {
  window.localStorage.clear()
})

describe('ScheduleProvider', () => {
  it('поднимает расписание из набора', () => {
    const { result } = mount()

    expect(result.current.lessons).toHaveLength(10)
    expect(result.current.summary.required).toBe(23)
    expect(result.current.canUndo).toBe(false)
  })

  it('пересчитывает прогресс после размещения', () => {
    const { result } = mount()

    act(() => result.current.run(place))

    expect(result.current.progress.get('SEC_AI310_01')).toEqual({
      placed: 1,
      required: 2,
      status: 'partial',
    })
    expect(result.current.summary.placed).toBe(11)
  })

  it('отменяет и повторяет действие', () => {
    const { result } = mount()

    act(() => result.current.run(place))
    expect(result.current.canUndo).toBe(true)

    act(() => result.current.undo())
    expect(result.current.lessons).toHaveLength(10)
    expect(result.current.canRedo).toBe(true)

    act(() => result.current.redo())
    expect(result.current.lessons).toHaveLength(11)
  })

  it('не пишет в историю действие, которое ничего не изменило', () => {
    const { result } = mount()

    act(() => result.current.run({ type: 'remove', lessonId: 'такого нет' }))

    expect(result.current.canUndo).toBe(false)
  })

  it('отдаёт идентификатор, который получит следующее занятие', () => {
    const { result } = mount()
    const promised = result.current.nextLessonId

    act(() => result.current.run(place))

    expect(result.current.lessons.at(-1)?.id).toBe(promised)
  })

  it('контекст правил учитывает свежие занятия', () => {
    const { result } = mount()

    act(() => result.current.run(place))

    const context = result.current.ruleContextFor()
    expect(context.occupancy.lessonsBySlot.get('FRI|SLOT_1600')).toHaveLength(1)
  })

  it('сохраняет расписание между запусками', () => {
    const first = mount()
    act(() => first.result.current.run(place))
    first.unmount()

    const second = mount()
    expect(second.result.current.lessons).toHaveLength(11)
  })

  it('сброс возвращает исходные данные и чистит хранилище', () => {
    const { result } = mount()

    act(() => result.current.run(place))
    act(() => result.current.resetToMock())

    expect(result.current.lessons).toHaveLength(10)
    expect(window.localStorage.getItem('schedule.lessons.v1')).toBe(JSON.stringify(DATASET.lessons))
  })
})

describe('useSchedule', () => {
  it('без провайдера сообщает об ошибке понятным текстом', () => {
    expect(() => renderHook(() => useSchedule())).toThrow(/ScheduleProvider/)
  })
})
