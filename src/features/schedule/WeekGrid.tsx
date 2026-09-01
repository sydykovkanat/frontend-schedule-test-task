import { Fragment, useMemo } from 'react'

import { slotKey } from '@/domain/keys'
import type { Lesson } from '@/domain/types'
import { useDragState } from '@/features/dnd/DragContext'
import { useSchedule } from '@/state/ScheduleContext'

import { LessonCard } from './LessonCard'
import { SlotCell } from './SlotCell'

interface WeekGridProps {
  selectedLessonId: string | null
  onOpenLesson: (lessonId: string) => void
}

export function WeekGrid({ selectedLessonId, onOpenLesson }: WeekGridProps) {
  const { dataset, index, lessons, audit } = useSchedule()
  const { placementAt, highlightedSectionId } = useDragState()

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

  const countByDay = useMemo(() => {
    const counts = new Map<string, number>()
    for (const lesson of lessons) counts.set(lesson.day, (counts.get(lesson.day) ?? 0) + 1)
    return counts
  }, [lessons])

  const highlightedSection = highlightedSectionId
    ? index.sectionById.get(highlightedSectionId)
    : undefined
  const highlightedCode = highlightedSection?.code
  const highlightedTone = highlightedSectionId
    ? index.toneBySectionId.get(highlightedSectionId)
    : undefined

  return (
    <div
      role="group"
      aria-label="Недельное расписание"
      className="bg-surface flex min-h-0 min-w-0 flex-1 flex-col overflow-auto"
    >
      <div
        className="bg-hairline grid h-full min-w-[58rem] gap-px"
        style={{
          gridTemplateColumns: `4.75rem repeat(${dataset.meta.weekDays.length}, minmax(9.5rem, 1fr))`,
          gridTemplateRows: `auto repeat(${dataset.timeSlots.length}, minmax(6.5rem, 1fr))`,
        }}
      >
        <div className="chrome-blur sticky top-0 left-0 z-30" />
        {dataset.meta.weekDays.map((day) => (
          <div
            key={day.id}
            className="chrome-blur sticky top-0 z-20 flex h-11 items-center justify-center gap-1.5"
          >
            <span className="text-foreground text-[0.8125rem] font-semibold">{day.label}</span>
            <span className="tnum text-muted-foreground bg-fill rounded-md px-1.5 py-px font-mono text-[0.6875rem] font-bold">
              {countByDay.get(day.id) ?? 0}
            </span>
          </div>
        ))}

        {dataset.timeSlots.map((timeSlot) => (
          <Fragment key={timeSlot.id}>
            <div className="bg-sidebar sticky left-0 z-10 flex flex-col items-end justify-center gap-0.5 px-3">
              <span className="tnum text-foreground font-mono text-[0.8125rem] font-bold">
                {timeSlot.start}
              </span>
              <span className="tnum text-muted-foreground font-mono text-[0.6875rem]">
                {timeSlot.end}
              </span>
            </div>
            {dataset.meta.weekDays.map((day) => (
              <SlotCell
                key={`${day.id}-${timeSlot.id}`}
                day={day.id}
                dayLabel={day.label}
                timeSlotId={timeSlot.id}
                timeLabel={timeSlot.start}
                placement={placementAt(day.id, timeSlot.id)}
                highlightedCode={highlightedCode}
                highlightedTone={highlightedTone}
              >
                {(lessonsBySlot.get(slotKey(day.id, timeSlot.id)) ?? []).map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    conflicts={audit.get(lesson.id) ?? []}
                    selected={selectedLessonId === lesson.id}
                    muted={
                      highlightedSectionId !== null && lesson.sectionId !== highlightedSectionId
                    }
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
