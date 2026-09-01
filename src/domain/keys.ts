import type { SlotRef, WeekDay } from './types'

export function slotKey(day: WeekDay, timeSlotId: string): string {
  return `${day}|${timeSlotId}`
}

export function slotRefKey(slot: SlotRef): string {
  return slotKey(slot.day, slot.timeSlotId)
}

export function blockedSlotKey(teacherId: string, day: WeekDay, timeSlotId: string): string {
  return `${teacherId}|${day}|${timeSlotId}`
}
