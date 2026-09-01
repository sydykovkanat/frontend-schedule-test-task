import { useDroppable } from '@dnd-kit/core'
import { SearchX, Undo2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

import { NO_FILTERS, filterSections, hasActiveFilters, type SectionFilters } from '@/domain/filtering'
import { FALLBACK_TONE } from '@/domain/palette'
import { useDragState } from '@/features/dnd/DragContext'
import { TRASH_DROPPABLE_ID } from '@/features/dnd/dragIds'
import { useListWindow } from '@/lib/useListWindow'
import { cn } from '@/lib/utils'
import { useSchedule } from '@/state/ScheduleContext'

import { SECTION_CARD_GAP, SECTION_CARD_STRIDE, SectionCard } from './SectionCard'
import { SectionFiltersBar } from './SectionFiltersBar'

export function SectionsPanel() {
  const { dataset, index, lessons, progress } = useSchedule()
  const { active, focusedSectionId, highlightedSectionId, focusSection } = useDragState()
  const { isOver, setNodeRef: setTrashRef } = useDroppable({ id: TRASH_DROPPABLE_ID })

  const [filters, setFilters] = useState<SectionFilters>(NO_FILTERS)
  const scrollRef = useRef<HTMLDivElement>(null)

  const visibleSections = useMemo(
    () => filterSections(dataset.sections, filters, { index, lessons, progress }),
    [dataset.sections, filters, index, lessons, progress],
  )

  const window = useListWindow(scrollRef, {
    itemCount: visibleSections.length,
    itemStride: SECTION_CARD_STRIDE,
  })

  const change = (next: Partial<SectionFilters>) => setFilters((current) => ({ ...current, ...next }))

  const filtered = visibleSections.length !== dataset.sections.length
  const removing = active?.kind === 'lesson'
  const removedCode = active ? index.sectionById.get(active.sectionId)?.code : null

  return (
    <section
      ref={setTrashRef}
      aria-label="Секции"
      className="bg-sidebar border-hairline relative flex min-h-0 shrink-0 flex-col max-lg:h-[20rem] max-lg:border-b lg:w-[21.5rem] lg:border-r"
    >
      <div className="flex h-11 shrink-0 items-center gap-2 px-4 pt-1">
        <h2 className="label-caps">Секции</h2>
        <span className="tnum text-muted-foreground bg-surface shadow-raise ml-auto rounded-md px-1.5 py-0.5 font-mono text-[0.6875rem] font-bold">
          {filtered ? `${visibleSections.length} из ${dataset.sections.length}` : dataset.sections.length}
        </span>
      </div>

      <div className="border-hairline shrink-0 border-b px-3 pb-3">
        <SectionFiltersBar
          filters={filters}
          teachers={dataset.teachers}
          rooms={dataset.rooms}
          onChange={change}
          onReset={() => setFilters(NO_FILTERS)}
          hasActive={hasActiveFilters(filters)}
        />
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pb-4">
        {visibleSections.length === 0 ? (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX aria-hidden />
              </EmptyMedia>
              <EmptyTitle>Ничего не найдено</EmptyTitle>
              <EmptyDescription>Ни одна секция не подходит под выбранные фильтры</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col" style={{ gap: SECTION_CARD_GAP }}>
            <div style={{ height: window.paddingTop }} aria-hidden />
            {visibleSections.slice(window.startIndex, window.endIndex).map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                course={index.courseById.get(section.courseId)}
                teacher={section.teacherId ? index.teacherById.get(section.teacherId) : undefined}
                tone={index.toneBySectionId.get(section.id) ?? FALLBACK_TONE}
                progress={
                  progress.get(section.id) ?? {
                    placed: 0,
                    required: section.requiredLessonsPerWeek,
                    status: 'unassigned',
                  }
                }
                focused={focusedSectionId === section.id}
                dimmed={highlightedSectionId !== null}
                onFocus={() => focusSection(focusedSectionId === section.id ? null : section.id)}
              />
            ))}
            <div style={{ height: window.paddingBottom }} aria-hidden />
          </div>
        )}
      </div>

      {removing ? (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-2 z-10 flex items-center justify-center gap-2 rounded-xl px-4 text-center text-[0.8125rem] font-semibold',
            'ease-schedule transition-colors duration-150',
            isOver
              ? 'bg-danger text-white shadow-lift'
              : 'text-muted-foreground bg-sidebar/85 shadow-[inset_0_0_0_1.5px_var(--hairline)] backdrop-blur-[2px]',
          )}
        >
          <Undo2 className="size-4 shrink-0" />
          Убрать {removedCode} из расписания
        </div>
      ) : null}
    </section>
  )
}
