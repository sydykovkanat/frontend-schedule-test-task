import { useDraggable } from '@dnd-kit/core'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Conflict, Lesson } from '@/domain/types'
import { lessonDraggableId } from '@/features/dnd/dragIds'
import { cn } from '@/lib/utils'
import { useSchedule } from '@/state/ScheduleContext'

interface LessonCardProps {
  lesson: Lesson
  conflicts: readonly Conflict[]
  selected: boolean
  onOpen: () => void
}

export function LessonCard({ lesson, conflicts, selected, onOpen }: LessonCardProps) {
  const { index } = useSchedule()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lessonDraggableId(lesson.id),
  })

  const section = index.sectionById.get(lesson.sectionId)
  const teacher = index.teacherById.get(lesson.teacherId)
  const room = index.roomById.get(lesson.roomId)

  const worst = conflicts.some((conflict) => conflict.level === 'error')
    ? 'error'
    : conflicts.length > 0
      ? 'warning'
      : null

  const card = (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      className={cn(
        'squircle-md bg-muted relative flex w-full cursor-grab touch-none flex-col gap-0.5 px-2 py-1.5 text-left',
        'transition-[box-shadow,opacity] duration-150 ease-schedule hover:shadow-lift',
        selected && 'ring-foreground ring-2',
        isDragging && 'opacity-25',
      )}
    >
      {worst ? (
        <span
          aria-hidden
          className={cn(
            'absolute top-2 right-2 size-1.5 rounded-full',
            worst === 'error' ? 'bg-destructive' : 'bg-warning',
          )}
        />
      ) : null}
      <span className="truncate pr-3 font-mono text-sm font-bold tracking-[-0.02em]">{section?.code}</span>
      <span className="text-muted-foreground truncate text-xs">{teacher?.shortName}</span>
      <span className="text-muted-foreground tnum truncate font-mono text-xs">
        {room?.name} · {room?.capacity}
      </span>
    </button>
  )

  if (conflicts.length === 0) return card

  return (
    <Tooltip>
      <TooltipTrigger render={card} />
      <TooltipContent className="max-w-64">
        <ul className="flex flex-col gap-1">
          {conflicts.map((conflict) => (
            <li key={conflict.code}>{conflict.message}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  )
}
