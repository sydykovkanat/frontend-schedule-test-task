import { useDroppable } from '@dnd-kit/core'
import { Ban, Plus } from 'lucide-react'
import type { ReactNode } from 'react'

import type { CourseTone } from '@/domain/palette'
import type { Placement, WeekDay } from '@/domain/types'
import { useDragState } from '@/features/dnd/DragContext'
import { slotDroppableId } from '@/features/dnd/dragIds'
import { cn } from '@/lib/utils'
import { useSchedule } from '@/state/ScheduleContext'

const TONE = {
  valid: 'bg-ok-soft',
  warning: 'bg-warn-soft',
  blocked: 'bg-fill-hover',
} as const

interface SlotCellProps {
  day: WeekDay
  dayLabel: string
  timeSlotId: string
  timeLabel: string
  placement: Placement | undefined
  highlightedCode: string | undefined
  highlightedTone: CourseTone | undefined
  children: ReactNode
}

interface GhostLessonProps {
  placement: Placement
  code: string
  tone: CourseTone | undefined
}

function GhostLesson({ placement, code, tone }: GhostLessonProps) {
  const { index } = useSchedule()
  const teacher = placement.assignment ? index.teacherById.get(placement.assignment.teacherId) : undefined
  const room = placement.assignment ? index.roomById.get(placement.assignment.roomId) : undefined

  return (
    <span
      aria-hidden
      data-tone={tone}
      className="bg-tone-soft/70 pointer-events-none relative z-10 flex flex-col gap-px rounded-lg py-1.5 pr-2.5 pl-3 shadow-[inset_0_0_0_1.5px_var(--tone)]"
    >
      <span className="text-tone-ink font-mono text-[0.8125rem] leading-tight font-bold tracking-[-0.02em]">
        {code}
      </span>
      <span className="text-tone-ink/70 truncate text-[0.6875rem] leading-tight font-medium">
        {teacher?.shortName} · {room?.name}
      </span>
    </span>
  )
}

export function SlotCell({
  day,
  dayLabel,
  timeSlotId,
  timeLabel,
  placement,
  highlightedCode,
  highlightedTone,
  children,
}: SlotCellProps) {
  const { active, focusedSectionId, placeFocusedAt } = useDragState()
  const { isOver, setNodeRef } = useDroppable({ id: slotDroppableId(day, timeSlotId) })

  const armed = focusedSectionId !== null && active === null
  const blocked = placement?.status === 'blocked'
  const showGhost = isOver && active !== null && placement !== undefined && !blocked

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group/slot relative flex min-h-[6.5rem] flex-col gap-1.5 p-1.5',
        'ease-schedule transition-colors duration-150',
        placement ? TONE[placement.status] : 'bg-surface',
        isOver && !blocked && 'outline-ok outline-2 -outline-offset-2',
        isOver && blocked && 'outline-danger/50 outline-2 -outline-offset-2',
      )}
    >
      {armed && highlightedCode ? (
        <button
          type="button"
          aria-label={
            blocked
              ? `${highlightedCode} нельзя поставить: ${dayLabel}, ${timeLabel}`
              : `Поставить ${highlightedCode}: ${dayLabel}, ${timeLabel}`
          }
          onClick={() => placeFocusedAt(day, timeSlotId)}
          className={cn(
            'absolute inset-0 z-0 flex items-center justify-center outline-none',
            'focus-visible:outline-brand focus-visible:outline-2 focus-visible:-outline-offset-2',
            blocked ? 'cursor-not-allowed' : 'cursor-pointer',
          )}
        >
          {blocked ? (
            <Ban
              aria-hidden
              className="text-muted-foreground size-4 opacity-0 transition-opacity duration-150 group-hover/slot:opacity-60"
            />
          ) : (
            <Plus
              aria-hidden
              className="text-ok-ink size-5 opacity-0 transition-opacity duration-150 group-hover/slot:opacity-100"
            />
          )}
        </button>
      ) : null}

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-1.5">{children}</div>

      {showGhost && highlightedCode ? (
        <GhostLesson placement={placement} code={highlightedCode} tone={highlightedTone} />
      ) : null}
    </div>
  )
}
