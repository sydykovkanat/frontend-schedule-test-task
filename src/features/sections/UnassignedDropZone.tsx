import { useDroppable } from '@dnd-kit/core'
import { Undo2 } from 'lucide-react'

import { useDragState } from '@/features/dnd/DragContext'
import { TRASH_DROPPABLE_ID } from '@/features/dnd/dragIds'
import { cn } from '@/lib/utils'
import { useSchedule } from '@/state/ScheduleContext'

export function UnassignedDropZone() {
  const { index } = useSchedule()
  const { active } = useDragState()
  const { isOver, setNodeRef } = useDroppable({ id: TRASH_DROPPABLE_ID })

  const armed = active?.kind === 'lesson'
  const code = active ? index.sectionById.get(active.sectionId)?.code : null

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'squircle-lg flex shrink-0 items-center justify-center gap-2 border border-dashed px-3 py-3 text-xs font-semibold',
        'transition-colors duration-150 ease-schedule',
        armed
          ? isOver
            ? 'border-destructive-line bg-destructive-soft text-destructive'
            : 'border-border text-foreground'
          : 'text-muted-foreground border-transparent',
      )}
    >
      <Undo2 className="size-3.5 shrink-0" aria-hidden />
      {armed ? `Убрать ${code} из расписания` : 'Перетащите занятие сюда, чтобы убрать'}
    </div>
  )
}
