import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SectionFilters } from '@/domain/filtering'
import type { Room, SectionStatus, Teacher } from '@/domain/types'

import { FilterSelect } from './FilterSelect'

const STATUS_OPTIONS = [
  { value: 'unassigned', label: 'Не распределены' },
  { value: 'partial', label: 'Частично' },
  { value: 'complete', label: 'Полностью' },
] as const

interface SectionFiltersBarProps {
  filters: SectionFilters
  teachers: readonly Teacher[]
  rooms: readonly Room[]
  onChange: (next: Partial<SectionFilters>) => void
  onReset: () => void
  hasActive: boolean
}

export function SectionFiltersBar({
  filters,
  teachers,
  rooms,
  onChange,
  onReset,
  hasActive,
}: SectionFiltersBarProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" aria-hidden />
        <Input
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Код, предмет или преподаватель"
          aria-label="Поиск секции"
          className="pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <FilterSelect
          label="Фильтр по преподавателю"
          placeholder="Преподаватель"
          value={filters.teacherId}
          onChange={(teacherId) => onChange({ teacherId })}
          options={teachers.map((teacher) => ({ value: teacher.id, label: teacher.shortName }))}
        />

        <FilterSelect
          label="Фильтр по аудитории"
          placeholder="Аудитория"
          value={filters.roomId}
          onChange={(roomId) => onChange({ roomId })}
          options={rooms.map((room) => ({ value: room.id, label: room.name }))}
        />

        <FilterSelect
          label="Фильтр по статусу распределения"
          placeholder="Статус"
          value={filters.status}
          onChange={(status) => onChange({ status: status as SectionStatus | null })}
          options={STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
        />

        {hasActive ? (
          <Button variant="link" size="sm" onClick={onReset}>
            Сбросить
          </Button>
        ) : null}
      </div>
    </div>
  )
}
