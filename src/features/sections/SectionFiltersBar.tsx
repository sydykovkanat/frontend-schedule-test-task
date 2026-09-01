import { Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import type { SectionFilters } from '@/domain/filtering'
import type { Room, SectionStatus, Teacher } from '@/domain/types'

import { FilterSelect } from './FilterSelect'

const STATUS_OPTIONS = [
  { value: 'unassigned', label: 'Не распределены' },
  { value: 'partial', label: 'Частично' },
  { value: 'complete', label: 'Полностью' },
] as const

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
}

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
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      searchRef.current?.focus()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          aria-hidden
        />
        <Input
          ref={searchRef}
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ query: event.target.value })}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            event.stopPropagation()
            if (filters.query) onChange({ query: '' })
            else searchRef.current?.blur()
          }}
          placeholder="Код, предмет или преподаватель"
          aria-label="Поиск секции"
          className="pr-8 pl-8 text-xs"
        />
        {filters.query ? (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Очистить поиск"
            onClick={() => {
              onChange({ query: '' })
              searchRef.current?.focus()
            }}
            className="absolute top-1/2 right-1.5 -translate-y-1/2"
          >
            <X aria-hidden />
          </Button>
        ) : (
          <Kbd aria-hidden className="absolute top-1/2 right-2 -translate-y-1/2">
            /
          </Kbd>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1">
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

        <div className="col-span-2 flex items-center gap-1">
          <div className="w-[calc(50%-0.125rem)]">
            <FilterSelect
              label="Фильтр по статусу распределения"
              placeholder="Статус"
              value={filters.status}
              onChange={(status) => onChange({ status: status as SectionStatus | null })}
              options={STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            />
          </div>

          {hasActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground gap-1 px-1.5"
            >
              <X aria-hidden />
              Сбросить
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
