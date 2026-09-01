import { describe, expect, it } from 'vitest'

import { canRedo, canUndo, createHistory, record, redo, undo } from '@/state/history'

describe('history', () => {
  it('свежая история никуда не ведёт', () => {
    const history = createHistory('a')

    expect(canUndo(history)).toBe(false)
    expect(canRedo(history)).toBe(false)
    expect(history.present).toBe('a')
  })

  it('запись сдвигает текущее значение в прошлое', () => {
    const history = record(createHistory('a'), 'b')

    expect(history.present).toBe('b')
    expect(history.past).toEqual(['a'])
    expect(canUndo(history)).toBe(true)
  })

  it('отмена и повтор возвращают то же значение', () => {
    const recorded = record(createHistory('a'), 'b')
    const undone = undo(recorded)

    expect(undone.present).toBe('a')
    expect(canRedo(undone)).toBe(true)
    expect(redo(undone).present).toBe('b')
  })

  it('новая запись стирает возможность повтора', () => {
    const undone = undo(record(createHistory('a'), 'b'))
    const next = record(undone, 'c')

    expect(canRedo(next)).toBe(false)
    expect(next.present).toBe('c')
  })

  it('отмена в пустой истории ничего не меняет', () => {
    const history = createHistory('a')

    expect(undo(history)).toBe(history)
    expect(redo(history)).toBe(history)
  })

  it('глубина истории ограничена', () => {
    let history = createHistory(0)
    for (let step = 1; step <= 10; step += 1) history = record(history, step, 3)

    expect(history.past).toEqual([7, 8, 9])
    expect(history.present).toBe(10)
  })

  it('запись того же значения не засоряет историю', () => {
    const history = record(createHistory('a'), 'a')

    expect(history.past).toEqual([])
  })
})
