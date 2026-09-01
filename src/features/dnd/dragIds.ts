import type { SlotRef, WeekDay } from '@/domain/types'

export const SECTION_PREFIX = 'section:'
export const LESSON_PREFIX = 'lesson:'
export const SLOT_PREFIX = 'slot:'
export const TRASH_DROPPABLE_ID = 'unassigned-zone'

export type DragSource =
  | { kind: 'section'; sectionId: string }
  | { kind: 'lesson'; sectionId: string; lessonId: string }

export function sectionDraggableId(sectionId: string): string {
  return `${SECTION_PREFIX}${sectionId}`
}

export function lessonDraggableId(lessonId: string): string {
  return `${LESSON_PREFIX}${lessonId}`
}

export function slotDroppableId(day: WeekDay, timeSlotId: string): string {
  return `${SLOT_PREFIX}${day}|${timeSlotId}`
}

export function parseSlotDroppableId(id: string): SlotRef | null {
  if (!id.startsWith(SLOT_PREFIX)) return null
  const [day, timeSlotId] = id.slice(SLOT_PREFIX.length).split('|')
  if (!day || !timeSlotId) return null
  return { day: day as WeekDay, timeSlotId }
}

export function isSlotDroppableId(id: string): boolean {
  return id.startsWith(SLOT_PREFIX)
}
