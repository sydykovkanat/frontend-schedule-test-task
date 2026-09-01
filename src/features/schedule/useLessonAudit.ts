import { useMemo } from 'react'

import { findConflicts } from '@/domain/conflicts'
import type { Conflict } from '@/domain/types'
import { useSchedule } from '@/state/ScheduleContext'

export function useLessonAudit(): ReadonlyMap<string, Conflict[]> {
  const { lessons, ruleContextFor } = useSchedule()

  return useMemo(() => {
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
        ruleContextFor(lesson.id),
      )
      if (conflicts.length > 0) audit.set(lesson.id, conflicts)
    }

    return audit
  }, [lessons, ruleContextFor])
}
