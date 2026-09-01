import { resolveAssignment } from './assignment'
import { findConflicts, type RuleContext } from './conflicts'
import { slotKey } from './keys'
import type { AssignmentLock, Conflict, Placement, PlacementStatus, SlotRef } from './types'

function statusOf(conflicts: readonly Conflict[]): PlacementStatus {
  if (conflicts.some((conflict) => conflict.level === 'error')) return 'blocked'
  if (conflicts.length > 0) return 'warning'
  return 'valid'
}

export function evaluatePlacement(
  sectionId: string,
  slot: SlotRef,
  context: RuleContext,
  lock: AssignmentLock = {},
): Placement {
  const resolved = resolveAssignment(sectionId, slot, context, lock)
  if (!resolved.ok) {
    return { status: 'blocked', conflicts: [resolved.conflict], assignment: null }
  }

  const conflicts = findConflicts(
    {
      sectionId,
      day: slot.day,
      timeSlotId: slot.timeSlotId,
      teacherId: resolved.assignment.teacherId,
      roomId: resolved.assignment.roomId,
    },
    context,
  )

  return { status: statusOf(conflicts), conflicts, assignment: resolved.assignment }
}

export function evaluateWeek(
  sectionId: string,
  context: RuleContext,
  lock: AssignmentLock = {},
): Map<string, Placement> {
  const week = new Map<string, Placement>()

  for (const day of context.index.dataset.meta.weekDays) {
    for (const timeSlot of context.index.dataset.timeSlots) {
      week.set(
        slotKey(day.id, timeSlot.id),
        evaluatePlacement(sectionId, { day: day.id, timeSlotId: timeSlot.id }, context, lock),
      )
    }
  }

  return week
}
