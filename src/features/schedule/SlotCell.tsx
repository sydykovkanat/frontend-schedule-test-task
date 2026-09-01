import { useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'

import type { Placement, WeekDay } from '@/domain/types'
import { useDragState } from '@/features/dnd/DragContext'
import { slotDroppableId } from '@/features/dnd/dragIds'
import { cn } from '@/lib/cn'
import { useSchedule } from '@/state/ScheduleContext'

const TONE = {
  valid: 'bg-success-soft',
  warning: 'bg-warning-soft',
  blocked: 'bg-destructive-soft',
} as const

interface SlotCellProps {
  day: WeekDay
  timeSlotId: string
  placement: Placement | undefined
  children: ReactNode
}

function GhostLesson({ placement, code }: { placement: Placement; code: string }) {
  const { index } = useSchedule()
  const teacher = placement.assignment ? index.teacherById.get(placement.assignment.teacherId) : undefined
  const room = placement.assignment ? index.roomById.get(placement.assignment.roomId) : undefined

  return (
    <span
      aria-hidden
      className={cn(
        'squircle-md pointer-events-none flex flex-col gap-0.5 border border-dashed px-2 py-1.5',
        placement.status === 'warning' ? 'border-warning-line text-warning' : 'border-success-line text-success',
      )}
    >
      <span className="font-mono text-sm font-bold tracking-[-0.02em]">{code}</span>
      <span className="truncate text-xs opacity-80">
        {teacher?.shortName} · {room?.name}
      </span>
    </span>
  )
}

export function SlotCell({ day, timeSlotId, placement, children }: SlotCellProps) {
  const { index } = useSchedule()
  const { active, highlightedSectionId } = useDragState()
  const { isOver, setNodeRef } = useDroppable({ id: slotDroppableId(day, timeSlotId) })

  const highlightedCode = highlightedSectionId
    ? index.sectionById.get(highlightedSectionId)?.code
    : undefined

  const showGhost = isOver && active !== null && placement !== undefined && placement.status !== 'blocked'

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-background relative flex min-h-[5.5rem] flex-col gap-1 p-1.5',
        'transition-colors duration-150 ease-schedule',
        placement && TONE[placement.status],
        isOver && placement?.status !== 'blocked' && 'ring-foreground/15 ring-2 ring-inset',
      )}
    >
      {placement?.status === 'blocked' ? (
        <span aria-hidden className="cell-blocked-cross pointer-events-none absolute inset-0 opacity-40" />
      ) : null}
      {children}
      {showGhost && highlightedCode ? <GhostLesson placement={placement} code={highlightedCode} /> : null}
    </div>
  )
}
