import type { KeyboardCoordinateGetter } from '@dnd-kit/core'

import { TRASH_DROPPABLE_ID, isSlotDroppableId } from './dragIds'

const ARROW_CODES = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const

type ArrowCode = (typeof ARROW_CODES)[number]

function isArrowCode(code: string): code is ArrowCode {
  return (ARROW_CODES as readonly string[]).includes(code)
}

function isAhead(code: ArrowCode, from: { x: number; y: number }, to: { x: number; y: number }): boolean {
  switch (code) {
    case 'ArrowUp':
      return to.y < from.y - 1
    case 'ArrowDown':
      return to.y > from.y + 1
    case 'ArrowLeft':
      return to.x < from.x - 1
    case 'ArrowRight':
      return to.x > from.x + 1
  }
}

function weightedDistance(
  code: ArrowCode,
  from: { x: number; y: number },
  to: { x: number; y: number },
): number {
  const alongAxis = code === 'ArrowUp' || code === 'ArrowDown' ? Math.abs(to.y - from.y) : Math.abs(to.x - from.x)
  const acrossAxis = code === 'ArrowUp' || code === 'ArrowDown' ? Math.abs(to.x - from.x) : Math.abs(to.y - from.y)
  return alongAxis + acrossAxis * 4
}

export const gridCoordinateGetter: KeyboardCoordinateGetter = (
  event,
  { currentCoordinates, context: { droppableContainers, collisionRect } },
) => {
  if (!isArrowCode(event.code) || !collisionRect) return undefined

  event.preventDefault()

  const origin = {
    x: collisionRect.left + collisionRect.width / 2,
    y: collisionRect.top + collisionRect.height / 2,
  }

  let closest: { x: number; y: number; distance: number } | null = null

  for (const container of droppableContainers.toArray()) {
    const id = String(container.id)
    const rect = container.rect.current
    if (!rect || container.disabled) continue
    if (!isSlotDroppableId(id) && id !== TRASH_DROPPABLE_ID) continue

    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    if (!isAhead(event.code, origin, center)) continue

    const distance = weightedDistance(event.code, origin, center)
    if (!closest || distance < closest.distance) {
      closest = { x: rect.left, y: rect.top, distance }
    }
  }

  if (!closest) return undefined

  return {
    x: currentCoordinates.x + (closest.x - collisionRect.left),
    y: currentCoordinates.y + (closest.y - collisionRect.top),
  }
}
