import { blockedSlotKey, slotKey } from './keys'
import type {
  Course,
  Lesson,
  Room,
  ScheduleDataset,
  Section,
  Teacher,
  TimeSlot,
} from './types'

export interface ScheduleIndex {
  dataset: ScheduleDataset
  sectionById: ReadonlyMap<string, Section>
  teacherById: ReadonlyMap<string, Teacher>
  roomById: ReadonlyMap<string, Room>
  courseById: ReadonlyMap<string, Course>
  timeSlotById: ReadonlyMap<string, TimeSlot>
  blockedReasonByKey: ReadonlyMap<string, string>
}

export interface Occupancy {
  lessonsBySlot: ReadonlyMap<string, readonly Lesson[]>
  lessonCountBySection: ReadonlyMap<string, number>
  lessonById: ReadonlyMap<string, Lesson>
}

function indexBy<T extends { id: string }>(items: readonly T[]): ReadonlyMap<string, T> {
  return new Map(items.map((item) => [item.id, item]))
}

export function buildScheduleIndex(dataset: ScheduleDataset): ScheduleIndex {
  return {
    dataset,
    sectionById: indexBy(dataset.sections),
    teacherById: indexBy(dataset.teachers),
    roomById: indexBy(dataset.rooms),
    courseById: indexBy(dataset.courses),
    timeSlotById: indexBy(dataset.timeSlots),
    blockedReasonByKey: new Map(
      dataset.teacherBlockedSlots.map((blocked) => [
        blockedSlotKey(blocked.teacherId, blocked.day, blocked.timeSlotId),
        blocked.reason,
      ]),
    ),
  }
}

export function buildOccupancy(lessons: readonly Lesson[]): Occupancy {
  const lessonsBySlot = new Map<string, Lesson[]>()
  const lessonCountBySection = new Map<string, number>()
  const lessonById = new Map<string, Lesson>()

  for (const lesson of lessons) {
    const key = slotKey(lesson.day, lesson.timeSlotId)
    const bucket = lessonsBySlot.get(key)
    if (bucket) bucket.push(lesson)
    else lessonsBySlot.set(key, [lesson])

    lessonCountBySection.set(lesson.sectionId, (lessonCountBySection.get(lesson.sectionId) ?? 0) + 1)
    lessonById.set(lesson.id, lesson)
  }

  return { lessonsBySlot, lessonCountBySection, lessonById }
}
