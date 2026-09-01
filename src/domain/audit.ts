import { findConflicts, type RuleContext } from './conflicts'
import type { Conflict, Lesson } from './types'

export type LessonAudit = ReadonlyMap<string, Conflict[]>

export function auditLessons(
  lessons: readonly Lesson[],
  contextFor: (excludeLessonId?: string) => RuleContext,
): LessonAudit {
  const audit = new Map<string, Conflict[]>()

  for (const lesson of lessons) {
    const conflicts = findConflicts(
      {
        sectionId: lesson.sectionId,
        day: lesson.day,
        timeSlotId: lesson.timeSlotId,
        teacherId: lesson.teacherId,
        roomId: lesson.roomId,
      },
      contextFor(lesson.id),
    )
    if (conflicts.length > 0) audit.set(lesson.id, conflicts)
  }

  return audit
}

export function worstLevel(conflicts: readonly Conflict[]): 'error' | 'warning' | null {
  if (conflicts.some((conflict) => conflict.level === 'error')) return 'error'
  return conflicts.length > 0 ? 'warning' : null
}
