import { Fragment, useMemo } from 'react'

import { slotKey } from '@/domain/keys'
import type { Lesson } from '@/domain/types'
import { useDragState } from '@/features/dnd/DragContext'
import { useSchedule } from '@/state/ScheduleContext'

import { LessonCard } from './LessonCard'
import { SlotCell } from './SlotCell'
import { useLessonAudit } from './useLessonAudit'

interface WeekGridProps {
  selectedLessonId: string | null
  onOpenLesson: (lessonId: string) => void
}

export function WeekGrid({ selectedLessonId, onOpenLesson }: WeekGridProps) {
  const { dataset, lessons } = useSchedule()
  const { placementAt } = useDragState()
  const audit = useLessonAudit()

  const lessonsBySlot = useMemo(() => {
    const bySlot = new Map<string, Lesson[]>()
    for (const lesson of lessons) {
      const key = slotKey(lesson.day, lesson.timeSlotId)
      const bucket = bySlot.get(key)
      if (bucket) bucket.push(lesson)
      else bySlot.set(key, [lesson])
    }
    return bySlot
  }, [lessons])

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div
        className="bg-border grid h-full min-w-[52rem] gap-px"
        style={{
          gridTemplateColumns: `4.75rem repeat(${dataset.meta.weekDays.length}, minmax(9rem, 1fr))`,
          gridTemplateRows: `auto repeat(${dataset.timeSlots.length}, minmax(5.5rem, 1fr))`,
        }}
      >
        <div className="bg-background" />
        {dataset.meta.weekDays.map((day) => (
          <div key={day.id} className="bg-background label-caps sticky top-0 z-10 px-2 pt-1 pb-2.5 text-center">
            {day.label}
          </div>
        ))}

        {dataset.timeSlots.map((timeSlot) => (
          <Fragment key={timeSlot.id}>
            <div className="bg-background flex flex-col items-end justify-center gap-0.5 pr-3 font-mono">
              <span className="tnum text-sm font-medium">{timeSlot.start}</span>
              <span className="tnum text-muted-foreground text-xs">{timeSlot.end}</span>
            </div>
            {dataset.meta.weekDays.map((day) => (
              <SlotCell
                key={`${day.id}-${timeSlot.id}`}
                day={day.id}
                timeSlotId={timeSlot.id}
                placement={placementAt(day.id, timeSlot.id)}
              >
                {(lessonsBySlot.get(slotKey(day.id, timeSlot.id)) ?? []).map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    conflicts={audit.get(lesson.id) ?? []}
                    selected={selectedLessonId === lesson.id}
                    onOpen={() => onOpenLesson(lesson.id)}
                  />
                ))}
              </SlotCell>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
