import { AlertTriangle, Check, X } from 'lucide-react'

import { FALLBACK_TONE } from '@/domain/palette'
import { useSchedule } from '@/state/ScheduleContext'
import { STUDENTS, plural } from '@/lib/plural'
import { cn } from '@/lib/utils'

import { useDragState } from './DragContext'
import { TRASH_DROPPABLE_ID, type DragSource } from './dragIds'

const STATUS_TONE = {
  valid: 'bg-ok-soft text-ok-ink',
  warning: 'bg-warn-soft text-warn-ink',
  blocked: 'bg-danger-soft text-danger-ink',
} as const

const STATUS_ICON = {
  valid: Check,
  warning: AlertTriangle,
  blocked: X,
} as const

interface DragPreviewProps {
  source: DragSource
}

export function DragPreview({ source }: DragPreviewProps) {
  const { index } = useSchedule()
  const { hoveredSlotKey, week } = useDragState()

  const section = index.sectionById.get(source.sectionId)
  const tone = index.toneBySectionId.get(source.sectionId) ?? FALLBACK_TONE
  const overTrash = hoveredSlotKey === TRASH_DROPPABLE_ID
  const placement = hoveredSlotKey && !overTrash ? week?.get(hoveredSlotKey) : undefined

  const verdict = overTrash
    ? { status: 'blocked' as const, text: 'Убрать из расписания' }
    : placement
      ? {
          status: placement.status,
          text:
            placement.conflicts.at(0)?.message ??
            (placement.assignment
              ? `${index.teacherById.get(placement.assignment.teacherId)?.shortName ?? ''} · ${index.roomById.get(placement.assignment.roomId)?.name ?? ''}`
              : 'Свободно'),
        }
      : null

  const VerdictIcon = verdict ? STATUS_ICON[verdict.status] : null

  return (
    <div data-tone={tone} className="w-56 cursor-grabbing">
      <div className="bg-surface shadow-drag relative flex flex-col gap-px overflow-hidden rounded-lg py-2 pr-3 pl-3.5">
        <span aria-hidden className="bg-tone absolute inset-y-0 left-0 w-[3px]" />
        <span className="text-tone-ink font-mono text-[0.8125rem] leading-tight font-bold tracking-[-0.02em]">
          {section?.code}
        </span>
        <span className="text-muted-foreground text-[0.6875rem] leading-tight">
          {section?.studentsCount} {plural(section?.studentsCount ?? 0, STUDENTS)}
        </span>
      </div>
      {verdict && VerdictIcon ? (
        <div
          className={cn(
            'shadow-raise mt-1.5 flex items-start gap-1.5 rounded-lg px-2.5 py-2 text-[0.6875rem] leading-snug font-semibold',
            STATUS_TONE[verdict.status],
          )}
        >
          <VerdictIcon className="mt-px size-3 shrink-0" aria-hidden />
          {verdict.text}
        </div>
      ) : null}
    </div>
  )
}
