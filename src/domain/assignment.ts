import { neighboursOf, type RuleContext } from './conflicts'
import { blockedSlotKey } from './keys'
import type { Assignment, AssignmentLock, Conflict, Lesson, Room, Section, SlotRef } from './types'

export type AssignmentResult =
  | { ok: true; assignment: Assignment }
  | { ok: false; conflict: Conflict }

function isTeacherFree(
  teacherId: string,
  slot: SlotRef,
  neighbours: readonly Lesson[],
  context: RuleContext,
): boolean {
  const blocked = context.index.blockedReasonByKey.has(
    blockedSlotKey(teacherId, slot.day, slot.timeSlotId),
  )
  return !blocked && !neighbours.some((lesson) => lesson.teacherId === teacherId)
}

function pickTeacher(
  section: Section,
  slot: SlotRef,
  neighbours: readonly Lesson[],
  context: RuleContext,
  lock: AssignmentLock,
): { teacherId: string; teacherAuto: boolean } | null {
  if (lock.teacherId) return { teacherId: lock.teacherId, teacherAuto: false }
  if (section.teacherId) return { teacherId: section.teacherId, teacherAuto: false }

  const available = section.allowedTeacherIds.find((teacherId) =>
    isTeacherFree(teacherId, slot, neighbours, context),
  )
  return available ? { teacherId: available, teacherAuto: true } : null
}

function bestRoomFor(section: Section, neighbours: readonly Lesson[], context: RuleContext): Room | undefined {
  const takenRoomIds = new Set(neighbours.map((lesson) => lesson.roomId))

  return context.index.dataset.rooms
    .filter((room) => room.capacity >= section.studentsCount && !takenRoomIds.has(room.id))
    .sort((left, right) => {
      const leftPreferred = left.type === section.preferredRoomType ? 0 : 1
      const rightPreferred = right.type === section.preferredRoomType ? 0 : 1
      return leftPreferred - rightPreferred || left.capacity - right.capacity
    })
    .at(0)
}

function pickRoom(
  section: Section,
  neighbours: readonly Lesson[],
  context: RuleContext,
  lock: AssignmentLock,
): { roomId: string; roomAuto: boolean } | null {
  if (lock.roomId) return { roomId: lock.roomId, roomAuto: false }

  const room = bestRoomFor(section, neighbours, context)
  return room ? { roomId: room.id, roomAuto: true } : null
}

export function resolveAssignment(
  sectionId: string,
  slot: SlotRef,
  context: RuleContext,
  lock: AssignmentLock = {},
): AssignmentResult {
  const section = context.index.sectionById.get(sectionId)
  if (!section) {
    return {
      ok: false,
      conflict: { code: 'NO_FREE_TEACHER', level: 'error', message: 'Секция не найдена' },
    }
  }

  const neighbours = neighboursOf(slot.day, slot.timeSlotId, context)

  const teacher = pickTeacher(section, slot, neighbours, context, lock)
  if (!teacher) {
    return {
      ok: false,
      conflict: {
        code: 'NO_FREE_TEACHER',
        level: 'error',
        message: 'Все допустимые преподаватели заняты в этом слоте',
      },
    }
  }

  const room = pickRoom(section, neighbours, context, lock)
  if (!room) {
    return {
      ok: false,
      conflict: {
        code: 'NO_FREE_ROOM',
        level: 'error',
        message: `Нет свободной аудитории на ${section.studentsCount} студентов`,
      },
    }
  }

  return { ok: true, assignment: { ...teacher, ...room } }
}
