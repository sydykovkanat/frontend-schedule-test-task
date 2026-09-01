import { FALLBACK_TONE } from '@/domain/palette'
import { useDragState } from '@/features/dnd/DragContext'
import { cn } from '@/lib/utils'
import { LESSONS, SLOTS, plural, withCount } from '@/lib/plural'
import { useSchedule } from '@/state/ScheduleContext'

export function StatusBar() {
  const { index, progress } = useSchedule()
  const { highlightedSectionId, notice, week } = useDragState()

  const section = highlightedSectionId ? index.sectionById.get(highlightedSectionId) : undefined
  const tone = highlightedSectionId
    ? (index.toneBySectionId.get(highlightedSectionId) ?? FALLBACK_TONE)
    : FALLBACK_TONE
  const sectionProgress = highlightedSectionId ? progress.get(highlightedSectionId) : undefined
  const left = sectionProgress ? Math.max(0, sectionProgress.required - sectionProgress.placed) : 0

  const counts = week
    ? [...week.values()].reduce(
        (totals, placement) => ({ ...totals, [placement.status]: totals[placement.status] + 1 }),
        { valid: 0, warning: 0, blocked: 0 },
      )
    : null

  const open = counts ? counts.valid + counts.warning : 0

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Подсказка"
      data-tone={tone}
      className={cn(
        'app-region bg-sidebar border-hairline flex h-10 shrink-0 items-center gap-2 overflow-hidden border-t px-4 text-[0.6875rem] font-medium',
        notice ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      {notice ? (
        <span className="truncate font-semibold">{notice}</span>
      ) : section && counts ? (
        <span className="flex min-w-0 items-center gap-2 truncate">
          <span className="bg-tone-soft text-tone-ink shrink-0 rounded-md px-1.5 py-0.5 font-mono font-bold">
            {section.code}
          </span>
          <span className="truncate">
            {left > 0 ? `осталось ${withCount(left, LESSONS)}` : 'норма закрыта'}
          </span>
          <span aria-hidden className="bg-fill-active size-[3px] shrink-0 rounded-full" />
          <span className="flex shrink-0 items-center gap-1.5">
            <span aria-hidden className="bg-ok size-[6px] shrink-0 rounded-full" />
            {withCount(open, SLOTS)} {plural(open, ['доступен', 'доступно', 'доступно'])}
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            <span aria-hidden className="bg-fill-active size-[6px] shrink-0 rounded-full" />
            {counts.blocked} {plural(counts.blocked, ['закрыт', 'закрыты', 'закрыты'])}
          </span>
        </span>
      ) : (
        <span className="truncate">
          Перетащите секцию в сетку или выберите её кликом и поставьте в слот
        </span>
      )}
    </div>
  )
}
