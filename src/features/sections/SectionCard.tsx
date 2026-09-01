import { useDraggable } from '@dnd-kit/core'
import { Check } from 'lucide-react'

import { ProgressPips } from '@/components/schedule/ProgressPips'
import type { CourseTone } from '@/domain/palette'
import type { Course, Section, SectionProgress, Teacher } from '@/domain/types'
import { sectionDraggableId } from '@/features/dnd/dragIds'
import { STUDENTS, plural } from '@/lib/plural'
import { cn } from '@/lib/utils'

export const SECTION_CARD_HEIGHT = 118
export const SECTION_CARD_GAP = 6
export const SECTION_CARD_STRIDE = SECTION_CARD_HEIGHT + SECTION_CARD_GAP

interface SectionCardProps {
  section: Section
  course: Course | undefined
  teacher: Teacher | undefined
  tone: CourseTone
  progress: SectionProgress
  focused: boolean
  dimmed: boolean
  onFocus: () => void
}

export function SectionCard({
  section,
  course,
  teacher,
  tone,
  progress,
  focused,
  dimmed,
  onFocus,
}: SectionCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: sectionDraggableId(section.id),
  })

  const complete = progress.status === 'complete'

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onFocus}
      aria-pressed={focused}
      data-tone={tone}
      style={{ height: SECTION_CARD_HEIGHT }}
      className={cn(
        'group relative flex w-full cursor-grab touch-none flex-col justify-center gap-2 overflow-hidden rounded-xl py-3 pr-3.5 pl-4 text-left',
        'ease-schedule transition-[background-color,box-shadow,opacity,transform] duration-150',
        focused
          ? 'bg-tone-soft shadow-[0_0_0_1.5px_var(--tone)]'
          : 'bg-surface shadow-raise hover:shadow-lift',
        dimmed && !focused && 'opacity-40',
        isDragging && 'opacity-30',
      )}
    >
      <span
        aria-hidden
        className="bg-tone absolute inset-y-0 left-0 w-[3px] rounded-r-[2px]"
      />

      <span className="flex items-baseline gap-2">
        <span className="text-foreground truncate font-mono text-[0.9375rem] font-bold tracking-[-0.02em]">
          {section.code}
        </span>
        <span
          className={cn(
            'tnum ml-auto flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[0.6875rem] font-bold',
            complete ? 'bg-ok-soft text-ok-ink' : 'bg-fill text-muted-foreground',
          )}
        >
          {complete ? <Check aria-hidden className="size-3" /> : null}
          {progress.placed}/{progress.required}
        </span>
      </span>

      <span
        title={course?.name}
        className="text-body line-clamp-1 text-[0.8125rem] leading-snug font-medium"
      >
        {course?.name}
      </span>

      <ProgressPips placed={progress.placed} required={progress.required} complete={complete} />

      <span className="text-muted-foreground flex items-center gap-2 text-[0.6875rem] font-medium">
        <span
          className="tnum shrink-0"
          title={`${section.studentsCount} ${plural(section.studentsCount, STUDENTS)}`}
        >
          {section.studentsCount} студ.
        </span>
        <span aria-hidden className="bg-fill-active size-[3px] shrink-0 rounded-full" />
        {teacher ? (
          <span title={teacher.name} className="truncate">
            {teacher.shortName}
          </span>
        ) : (
          <span className="text-warn-ink truncate font-semibold">преподаватель не назначен</span>
        )}
      </span>
    </button>
  )
}
