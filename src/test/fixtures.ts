import raw from '@/data/schedule-mock-data.json'
import type { RuleContext } from '@/domain/conflicts'
import { buildOccupancy, buildScheduleIndex } from '@/domain/indexes'
import type { Lesson, ScheduleDataset } from '@/domain/types'

export const DATASET = raw as unknown as ScheduleDataset
export const INDEX = buildScheduleIndex(DATASET)

export function ctx(lessons: Lesson[] = DATASET.lessons, excludeLessonId?: string): RuleContext {
  return { index: INDEX, occupancy: buildOccupancy(lessons), lessons, excludeLessonId }
}

export function lesson(patch: Partial<Lesson> & Pick<Lesson, 'id' | 'sectionId'>): Lesson {
  return {
    teacherId: 'T1',
    roomId: 'R201',
    day: 'MON',
    timeSlotId: 'SLOT_0830',
    ...patch,
  }
}
