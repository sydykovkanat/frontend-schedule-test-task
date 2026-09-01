import { useDragState } from '@/features/dnd/DragContext'
import { cn } from '@/lib/cn'
import { useSchedule } from '@/state/ScheduleContext'

function Key({ children }: { children: string }) {
  return (
    <kbd className="squircle-md bg-secondary text-foreground px-1.5 py-0.5 font-mono text-xs font-semibold">
      {children}
    </kbd>
  )
}

export function StatusBar() {
  const { index } = useSchedule()
  const { highlightedSectionId, notice, week } = useDragState()

  const section = highlightedSectionId ? index.sectionById.get(highlightedSectionId) : undefined

  const counts = week
    ? [...week.values()].reduce(
        (totals, placement) => ({ ...totals, [placement.status]: totals[placement.status] + 1 }),
        { valid: 0, warning: 0, blocked: 0 },
      )
    : null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-h-8 shrink-0 flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm',
        notice ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      {notice ? (
        <span className="font-semibold">{notice}</span>
      ) : section && counts ? (
        <>
          <span className="font-mono font-bold">{section.code}</span>
          <span>
            <span className="text-success font-semibold">{counts.valid}</span> свободных,{' '}
            <span className="text-warning font-semibold">{counts.warning}</span> с оговоркой,{' '}
            <span className="text-destructive font-semibold">{counts.blocked}</span> закрыты
          </span>
        </>
      ) : (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          Перетащите секцию в сетку или выберите её кликом. С клавиатуры: <Key>Tab</Key> до карточки,
          <Key>Пробел</Key> взять, стрелки — выбрать слот, <Key>Пробел</Key> поставить.
        </span>
      )}
    </div>
  )
}
