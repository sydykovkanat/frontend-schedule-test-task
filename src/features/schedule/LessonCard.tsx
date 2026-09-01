import { useDraggable } from '@dnd-kit/core'
import { AlertTriangle } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { worstLevel } from '@/domain/audit'
import { FALLBACK_TONE } from '@/domain/palette'
import type { Conflict, Lesson } from '@/domain/types'
import { lessonDraggableId } from '@/features/dnd/dragIds'
import { cn } from '@/lib/utils'
import { useSchedule } from '@/state/ScheduleContext'

interface LessonCardProps {
  lesson: Lesson
  conflicts: readonly Conflict[]
  selected: boolean
  muted: boolean
  onOpen: () => void
}

export function LessonCard({ lesson, conflicts, selected, muted, onOpen }: LessonCardProps) {
  const { index } = useSchedule()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lessonDraggableId(lesson.id),
  })

  const section = index.sectionById.get(lesson.sectionId)
  const teacher = index.teacherById.get(lesson.teacherId)
  const room = index.roomById.get(lesson.roomId)
  const tone = index.toneBySectionId.get(lesson.sectionId) ?? FALLBACK_TONE
  const worst = worstLevel(conflicts)

  const card = (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      data-tone={tone}
      data-selected={selected || undefined}
      className={cn(
        'group/lesson relative flex w-full min-h-0 flex-1 cursor-grab touch-none flex-col gap-px overflow-hidden rounded-lg py-1.5 pr-2.5 pl-3 text-left',
        'ease-schedule transition-[background-color,box-shadow,opacity] duration-150',
        selected
          ? 'bg-tone text-white shadow-lift'
          : 'bg-tone-soft hover:bg-tone-soft-strong',
        !selected && worst === 'error' && 'shadow-[0_0_0_1.5px_var(--danger-solid)]',
        !selected && worst === 'warning' && 'shadow-[0_0_0_1.5px_var(--warn-solid)]',
        muted && !selected && 'opacity-45',
        isDragging && 'opacity-30',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-0 w-[3px]',
          selected ? 'bg-white/70' : 'bg-tone',
        )}
      />

      {worst ? (
        <AlertTriangle
          aria-hidden
          className={cn(
            'absolute top-1.5 right-1.5 size-3',
            selected ? 'text-white' : worst === 'error' ? 'text-danger' : 'text-warn',
          )}
        />
      ) : null}

      <span
        className={cn(
          'truncate pr-4 font-mono text-[0.8125rem] leading-tight font-bold tracking-[-0.02em]',
          selected ? 'text-white' : 'text-tone-ink',
        )}
      >
        {section?.code}
      </span>
      <span
        className={cn(
          'truncate text-[0.6875rem] leading-tight font-medium',
          selected ? 'text-white/80' : 'text-tone-ink/70',
        )}
      >
        {teacher?.shortName}
      </span>
      <span
        className={cn(
          'tnum truncate font-mono text-[0.6875rem] leading-tight',
          selected ? 'text-white/70' : 'text-tone-ink/60',
        )}
      >
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
            <li key={conflict.code} className={cn(conflict.level === 'warning' && 'opacity-70')}>
              {conflict.message}
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  )
}
