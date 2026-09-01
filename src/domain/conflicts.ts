import type { Occupancy, ScheduleIndex } from './indexes'
import { blockedSlotKey, slotKey } from './keys'
import type { Conflict, Lesson, Room, RoomType, Section, WeekDay } from './types'

export interface PlacementTarget {
  sectionId: string
  day: WeekDay
  timeSlotId: string
  teacherId: string
  roomId: string
}

export interface RuleContext {
  index: ScheduleIndex
  occupancy: Occupancy
  lessons: readonly Lesson[]
  excludeLessonId?: string
}

interface SlotScope {
  section: Section
  room: Room | undefined
  teacherName: string
  neighbours: readonly Lesson[]
  placedLessons: number
  blockedReason: string | undefined
}

type ConflictRule = (target: PlacementTarget, scope: SlotScope, context: RuleContext) => Conflict | null

const ROOM_TYPE_NAME: Record<RoomType, string> = {
  LECTURE: 'лекционная аудитория',
  COMPUTER_LAB: 'компьютерный класс',
}

function sectionCodeOf(lesson: Lesson, context: RuleContext): string {
  return context.index.sectionById.get(lesson.sectionId)?.code ?? lesson.sectionId
}

const sectionAlreadyInSlot: ConflictRule = (target, scope) => {
  const clash = scope.neighbours.find((lesson) => lesson.sectionId === target.sectionId)
  if (!clash) return null
  return {
    code: 'SECTION_BUSY',
    level: 'error',
    message: `${scope.section.code} уже стоит в этом слоте`,
  }
}

const teacherUnavailable: ConflictRule = (_target, scope) => {
  if (!scope.blockedReason) return null
  return {
    code: 'TEACHER_BLOCKED',
    level: 'error',
    message: `${scope.teacherName} — ${scope.blockedReason.toLowerCase()}`,
  }
}

const teacherAlreadyTeaching: ConflictRule = (target, scope, context) => {
  const clash = scope.neighbours.find((lesson) => lesson.teacherId === target.teacherId)
  if (!clash) return null
  return {
    code: 'TEACHER_BUSY',
    level: 'error',
    message: `${scope.teacherName} ведёт ${sectionCodeOf(clash, context)} в этом слоте`,
  }
}

const roomAlreadyTaken: ConflictRule = (target, scope, context) => {
  if (!scope.room) return null
  const clash = scope.neighbours.find((lesson) => lesson.roomId === target.roomId)
  if (!clash) return null
  return {
    code: 'ROOM_BUSY',
    level: 'error',
    message: `${scope.room.name} занята — там ${sectionCodeOf(clash, context)}`,
  }
}

const roomTooSmall: ConflictRule = (_target, scope) => {
  if (!scope.room || scope.room.capacity >= scope.section.studentsCount) return null
  return {
    code: 'ROOM_CAPACITY',
    level: 'error',
    message: `${scope.room.name}: ${scope.room.capacity} мест на ${scope.section.studentsCount} студентов`,
  }
}

const roomTypeMismatch: ConflictRule = (_target, scope) => {
  if (!scope.room || scope.room.type === scope.section.preferredRoomType) return null
  return {
    code: 'ROOM_TYPE',
    level: 'warning',
    message: `${scope.room.name} — не ${ROOM_TYPE_NAME[scope.section.preferredRoomType]}`,
  }
}

const weeklyQuotaReached: ConflictRule = (_target, scope) => {
  if (scope.placedLessons < scope.section.requiredLessonsPerWeek) return null
  return {
    code: 'QUOTA_FULL',
    level: 'warning',
    message: `Норма ${scope.section.requiredLessonsPerWeek} занятий в неделю уже набрана`,
  }
}

const RULES: readonly ConflictRule[] = [
  sectionAlreadyInSlot,
  teacherUnavailable,
  teacherAlreadyTeaching,
  roomAlreadyTaken,
  roomTooSmall,
  roomTypeMismatch,
  weeklyQuotaReached,
]

export function neighboursOf(
  day: WeekDay,
  timeSlotId: string,
  context: RuleContext,
): readonly Lesson[] {
  const inSlot = context.occupancy.lessonsBySlot.get(slotKey(day, timeSlotId)) ?? []
  if (!context.excludeLessonId) return inSlot
  return inSlot.filter((lesson) => lesson.id !== context.excludeLessonId)
}

export function placedLessonsOf(sectionId: string, context: RuleContext): number {
  const total = context.occupancy.lessonCountBySection.get(sectionId) ?? 0
  if (!context.excludeLessonId) return total
  const excluded = context.occupancy.lessonById.get(context.excludeLessonId)
  return excluded?.sectionId === sectionId ? total - 1 : total
}

export function findConflicts(target: PlacementTarget, context: RuleContext): Conflict[] {
  const section = context.index.sectionById.get(target.sectionId)
  if (!section) return []

  const scope: SlotScope = {
    section,
    room: context.index.roomById.get(target.roomId),
    teacherName: context.index.teacherById.get(target.teacherId)?.shortName ?? 'Преподаватель',
    neighbours: neighboursOf(target.day, target.timeSlotId, context),
    placedLessons: placedLessonsOf(target.sectionId, context),
    blockedReason: context.index.blockedReasonByKey.get(
      blockedSlotKey(target.teacherId, target.day, target.timeSlotId),
    ),
  }

  const conflicts = RULES.map((rule) => rule(target, scope, context)).filter(
    (conflict): conflict is Conflict => conflict !== null,
  )

  const ownLessonHere = conflicts.find((conflict) => conflict.code === 'SECTION_BUSY')
  return ownLessonHere ? [ownLessonHere] : conflicts
}
