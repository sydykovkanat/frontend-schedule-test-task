import { SearchX } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

import { NO_FILTERS, filterSections, hasActiveFilters, type SectionFilters } from '@/domain/filtering'
import { useDragState } from '@/features/dnd/DragContext'
import { useListWindow } from '@/lib/useListWindow'
import { useSchedule } from '@/state/ScheduleContext'

import { SECTION_CARD_GAP, SECTION_CARD_STRIDE, SectionCard } from './SectionCard'
import { SectionFiltersBar } from './SectionFiltersBar'
import { UnassignedDropZone } from './UnassignedDropZone'

export function SectionsPanel() {
  const { dataset, index, lessons, progress } = useSchedule()
  const { focusedSectionId, highlightedSectionId, focusSection } = useDragState()

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

  return (
    <section aria-label="Секции" className="flex min-h-0 flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2.5">
          <h2 className="label-caps">Секции</h2>
          <span className="tnum text-muted-foreground font-mono text-xs">
            {visibleSections.length === dataset.sections.length
              ? dataset.sections.length
              : `${visibleSections.length} из ${dataset.sections.length}`}
          </span>
        </div>
        <SectionFiltersBar
          filters={filters}
          teachers={dataset.teachers}
          rooms={dataset.rooms}
          onChange={change}
          onReset={() => setFilters(NO_FILTERS)}
          hasActive={hasActiveFilters(filters)}
        />
      </div>

      <div
        ref={scrollRef}
        className="-mx-3 min-h-0 flex-1 overflow-y-auto px-3 [mask-image:linear-gradient(to_bottom,transparent,black_1.25rem,black_calc(100%-2rem),transparent)]"
      >
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
                progress={progress.get(section.id) ?? { placed: 0, required: section.requiredLessonsPerWeek, status: 'unassigned' }}
                focused={focusedSectionId === section.id}
                dimmed={highlightedSectionId !== null}
                onFocus={() => focusSection(focusedSectionId === section.id ? null : section.id)}
              />
            ))}
            <div style={{ height: window.paddingBottom }} aria-hidden />
          </div>
        )}
      </div>

      <UnassignedDropZone />
    </section>
  )
}
