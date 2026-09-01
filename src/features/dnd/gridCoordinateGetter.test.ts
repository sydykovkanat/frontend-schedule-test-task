import { describe, expect, it, vi } from 'vitest'

import { gridCoordinateGetter } from './gridCoordinateGetter'
import { TRASH_DROPPABLE_ID, slotDroppableId } from './dragIds'

interface FakeCell {
  id: string
  left: number
  top: number
  disabled?: boolean
}

const CELL = 100
const GRID: FakeCell[] = [
  { id: slotDroppableId('MON', 'A'), left: 0, top: 0 },
  { id: slotDroppableId('TUE', 'A'), left: CELL, top: 0 },
  { id: slotDroppableId('WED', 'A'), left: CELL * 2, top: 0 },
  { id: slotDroppableId('MON', 'B'), left: 0, top: CELL },
  { id: slotDroppableId('TUE', 'B'), left: CELL, top: CELL },
  { id: slotDroppableId('WED', 'B'), left: CELL * 2, top: CELL },
]

function call(code: string, from: { left: number; top: number }, cells: FakeCell[] = GRID) {
  const event = { code, preventDefault: vi.fn() } as unknown as KeyboardEvent

  const context = {
    droppableContainers: {
      toArray: () =>
        cells.map((cell) => ({
          id: cell.id,
          disabled: cell.disabled ?? false,
          rect: { current: { left: cell.left, top: cell.top, width: CELL, height: CELL } },
        })),
    },
    collisionRect: { left: from.left, top: from.top, width: CELL, height: CELL },
  }

  const args = {
    currentCoordinates: { x: 0, y: 0 },
    context,
  } as unknown as Parameters<typeof gridCoordinateGetter>[1]

  return gridCoordinateGetter(event, args)
}

describe('gridCoordinateGetter', () => {
  it('не реагирует на клавиши кроме стрелок', () => {
    expect(call('KeyA', { left: 0, top: 0 })).toBeUndefined()
  })

  it('переходит в соседнюю колонку справа', () => {
    expect(call('ArrowRight', { left: 0, top: 0 })).toEqual({ x: CELL, y: 0 })
  })

  it('переходит в соседнюю колонку слева', () => {
    expect(call('ArrowLeft', { left: CELL * 2, top: 0 })).toEqual({ x: -CELL, y: 0 })
  })

  it('переходит на строку ниже', () => {
    expect(call('ArrowDown', { left: 0, top: 0 })).toEqual({ x: 0, y: CELL })
  })

  it('переходит на строку выше', () => {
    expect(call('ArrowUp', { left: 0, top: CELL })).toEqual({ x: 0, y: -CELL })
  })

  it('держится своей колонки, а не прыгает по диагонали', () => {
    expect(call('ArrowDown', { left: CELL, top: 0 })).toEqual({ x: 0, y: CELL })
  })

  it('на краю сетки остаётся на месте', () => {
    expect(call('ArrowUp', { left: 0, top: 0 })).toBeUndefined()
    expect(call('ArrowRight', { left: CELL * 2, top: 0 })).toBeUndefined()
  })

  it('пропускает отключённые ячейки', () => {
    const cells = GRID.map((cell) =>
      cell.id === slotDroppableId('TUE', 'A') ? { ...cell, disabled: true } : cell,
    )

    expect(call('ArrowRight', { left: 0, top: 0 }, cells)).toEqual({ x: CELL * 2, y: 0 })
  })

  it('видит зону возврата наравне со слотами', () => {
    const cells = [...GRID, { id: TRASH_DROPPABLE_ID, left: 0, top: CELL * 2 }]

    expect(call('ArrowDown', { left: 0, top: CELL }, cells)).toEqual({ x: 0, y: CELL })
  })

  it('игнорирует посторонние зоны сброса', () => {
    const cells = [{ id: 'что-то-другое', left: CELL, top: 0 }]

    expect(call('ArrowRight', { left: 0, top: 0 }, cells)).toBeUndefined()
  })

  it('перехватывает событие, чтобы страница не прокручивалась', () => {
    const event = { code: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent
    const args = {
      currentCoordinates: { x: 0, y: 0 },
      context: {
        droppableContainers: { toArray: () => [] },
        collisionRect: { left: 0, top: 0, width: CELL, height: CELL },
      },
    } as unknown as Parameters<typeof gridCoordinateGetter>[1]

    gridCoordinateGetter(event, args)

    expect(event.preventDefault).toHaveBeenCalled()
  })
})
