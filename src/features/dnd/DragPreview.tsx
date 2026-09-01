import { useSchedule } from '@/state/ScheduleContext'
import { cn } from '@/lib/cn'

import { useDragState } from './DragContext'
import { TRASH_DROPPABLE_ID, type DragSource } from './dragIds'

const STATUS_TONE = {
  valid: 'border-success-line bg-success-soft text-success',
  warning: 'border-warning-line bg-warning-soft text-warning',
  blocked: 'border-destructive-line bg-destructive-soft text-destructive',
} as const

interface DragPreviewProps {
  source: DragSource
}

export function DragPreview({ source }: DragPreviewProps) {
  const { index } = useSchedule()
  const { hoveredSlotKey, week } = useDragState()

  const section = index.sectionById.get(source.sectionId)
  const overTrash = hoveredSlotKey === TRASH_DROPPABLE_ID
  const placement = hoveredSlotKey && !overTrash ? week?.get(hoveredSlotKey) : undefined

  const verdict = overTrash
    ? { tone: STATUS_TONE.blocked, text: 'Убрать из расписания' }
    : placement
      ? {
          tone: STATUS_TONE[placement.status],
          text:
            placement.conflicts.at(0)?.message ??
            (placement.assignment
              ? `${index.teacherById.get(placement.assignment.teacherId)?.shortName ?? ''} · ${index.roomById.get(placement.assignment.roomId)?.name ?? ''}`
              : 'Свободно'),
        }
      : null

  return (
    <div className="w-56 cursor-grabbing">
      <div className="squircle-lg bg-background shadow-lift flex flex-col gap-0.5 border border-border px-2.5 py-2">
        <span className="font-mono text-sm font-bold tracking-tight">{section?.code}</span>
        <span className="text-2xs text-muted-foreground">{section?.studentsCount} студентов</span>
      </div>
      {verdict ? (
        <div className={cn('squircle-md mt-1 border px-2 py-1 text-2xs leading-snug font-semibold', verdict.tone)}>
          {verdict.text}
        </div>
      ) : null}
    </div>
  )
}
