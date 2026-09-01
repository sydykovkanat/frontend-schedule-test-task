import { Search } from 'lucide-react'

import type { SectionFilters } from '@/domain/filtering'
import type { Room, SectionStatus, Teacher } from '@/domain/types'
import { cn } from '@/lib/cn'

const STATUS_OPTIONS: { value: SectionStatus; label: string }[] = [
  { value: 'unassigned', label: 'Не распределены' },
  { value: 'partial', label: 'Частично' },
  { value: 'complete', label: 'Полностью' },
]

const selectClassName = cn(
  'squircle-md text-muted-foreground hover:text-foreground min-w-0 cursor-pointer appearance-none',
  'bg-secondary py-1.5 pr-2.5 pl-2.5 text-xs font-semibold',
  'focus:text-foreground transition-colors duration-150 focus:outline-none',
)

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
    <div className="flex flex-col gap-3">
      <div className="border-border focus-within:border-foreground relative flex border-b pb-2 transition-colors duration-150">
        <Search className="text-muted-foreground pointer-events-none mt-1 mr-2 size-4 shrink-0" aria-hidden />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Код, предмет или преподаватель"
          aria-label="Поиск секции"
          className="placeholder:text-muted-foreground w-full bg-transparent text-sm focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <select
          value={filters.teacherId ?? ''}
          onChange={(event) => onChange({ teacherId: event.target.value || null })}
          aria-label="Фильтр по преподавателю"
          className={selectClassName}
        >
          <option value="">Преподаватель</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.shortName}
            </option>
          ))}
        </select>

        <select
          value={filters.roomId ?? ''}
          onChange={(event) => onChange({ roomId: event.target.value || null })}
          aria-label="Фильтр по аудитории"
          className={selectClassName}
        >
          <option value="">Аудитория</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status ?? ''}
          onChange={(event) => onChange({ status: (event.target.value || null) as SectionStatus | null })}
          aria-label="Фильтр по статусу распределения"
          className={selectClassName}
        >
          <option value="">Статус</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasActive ? (
          <button
            type="button"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground px-1.5 text-xs font-semibold underline underline-offset-4 transition-colors duration-150"
          >
            Сбросить
          </button>
        ) : null}
      </div>
    </div>
  )
}
