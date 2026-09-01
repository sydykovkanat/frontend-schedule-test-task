import { useDraggable } from '@dnd-kit/core'

import { ProgressPips } from '@/components/schedule/ProgressPips'
import type { Course, Section, SectionProgress, Teacher } from '@/domain/types'
import { sectionDraggableId } from '@/features/dnd/dragIds'
import { cn } from '@/lib/utils'

export const SECTION_CARD_HEIGHT = 106
export const SECTION_CARD_GAP = 2
export const SECTION_CARD_STRIDE = SECTION_CARD_HEIGHT + SECTION_CARD_GAP

interface SectionCardProps {
  section: Section
  course: Course | undefined
  teacher: Teacher | undefined
  progress: SectionProgress
  focused: boolean
  dimmed: boolean
  onFocus: () => void
}

export function SectionCard({
  section,
  course,
  teacher,
  progress,
  focused,
  dimmed,
  onFocus,
}: SectionCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: sectionDraggableId(section.id),
  })

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onFocus}
      aria-pressed={focused}
      style={{ height: SECTION_CARD_HEIGHT }}
      className={cn(
        'group relative flex w-full cursor-grab touch-none flex-col justify-center gap-2 px-3 text-left',
        'after:bg-border after:absolute after:right-3 after:bottom-0 after:left-3 after:h-px after:content-[""] last:after:hidden',
        'transition-[background-color,opacity] duration-150 ease-schedule',
        focused ? 'squircle-lg bg-secondary after:hidden' : 'hover:squircle-lg hover:bg-muted hover:after:hidden',
        dimmed && !focused && 'opacity-30',
        isDragging && 'opacity-25',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-3 bottom-3 left-0 w-[3px] rounded-full transition-opacity duration-150',
          focused ? 'bg-foreground opacity-100' : 'opacity-0',
        )}
      />

      <span className="flex items-baseline gap-3">
        <span className="truncate font-mono text-base font-bold tracking-[-0.02em]">{section.code}</span>
        <span
          className={cn(
            'tnum ml-auto font-mono text-sm font-semibold',
            progress.status === 'complete' ? 'text-success' : 'text-muted-foreground',
          )}
        >
          {progress.placed}/{progress.required}
        </span>
      </span>

      <span className="text-muted-foreground line-clamp-1 text-sm leading-snug">{course?.name}</span>

      <ProgressPips
        placed={progress.placed}
        required={progress.required}
        complete={progress.status === 'complete'}
      />

      <span className="text-muted-foreground flex items-center gap-2 text-xs">
        <span className="tnum">{section.studentsCount} студ.</span>
        <span aria-hidden className="bg-border size-[3px] shrink-0 rounded-full" />
        {teacher ? (
          <span className="truncate">{teacher.shortName}</span>
        ) : (
          <span className="text-warning font-semibold">преподаватель не назначен</span>
        )}
      </span>
    </button>
  )
}
