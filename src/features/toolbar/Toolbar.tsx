import { AlertTriangle, CalendarRange, Redo2, RotateCcw, Undo2 } from 'lucide-react'
import { useMemo, useRef } from 'react'

import { ProgressRing } from '@/components/schedule/ProgressRing'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CONFLICTS, DAYS, PAIRS, SECTIONS, withCount } from '@/lib/plural'
import { useSchedule } from '@/state/ScheduleContext'

interface ToolbarActionProps {
  label: string
  hint: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

function ToolbarAction({ label, hint, disabled, onClick, children }: ToolbarActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}

interface ToolbarProps {
  onOpenLesson: (lessonId: string) => void
}

export function Toolbar({ onOpenLesson }: ToolbarProps) {
  const { audit, dataset, lessons, summary, undo, redo, canUndo, canRedo, resetToMock } =
    useSchedule()

  const problemIds = useMemo(
    () => lessons.filter((lesson) => audit.has(lesson.id)).map((lesson) => lesson.id),
    [audit, lessons],
  )
  const cursor = useRef(0)

  const openNextProblem = () => {
    if (problemIds.length === 0) return
    const next = problemIds[cursor.current % problemIds.length]
    cursor.current = (cursor.current + 1) % problemIds.length
    onOpenLesson(next)
  }

  const done = summary.placed >= summary.required

  return (
    <header className="app-region chrome-blur border-hairline relative z-20 flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-linear-to-b from-[#3aa0ff] to-[#0064d2] text-white shadow-ink"
      >
        <CalendarRange className="size-4.5" />
      </span>

      <div className="flex min-w-0 flex-col gap-px">
        <h1 className="truncate text-[0.9375rem] leading-tight font-semibold">Расписание секций</h1>
        <p className="text-muted-foreground truncate text-[0.6875rem] leading-tight font-medium">
          {withCount(dataset.meta.weekDays.length, DAYS)} · {withCount(dataset.timeSlots.length, PAIRS)} ·{' '}
          {withCount(dataset.sections.length, SECTIONS)}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {problemIds.length > 0 ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="danger"
                  size="sm"
                  onClick={openNextProblem}
                  aria-label={`Показать следующее занятие с конфликтом, всего ${problemIds.length}`}
                >
                  <AlertTriangle aria-hidden />
                  {withCount(problemIds.length, CONFLICTS)}
                </Button>
              }
            />
            <TooltipContent>Перейти к следующему конфликту</TooltipContent>
          </Tooltip>
        ) : null}

        <Tooltip>
          <TooltipTrigger
            render={
              <div className="bg-fill flex h-8 items-center gap-2 rounded-lg pr-2.5 pl-1.5">
                <ProgressRing value={summary.placed} total={summary.required} />
                <p className="tnum text-foreground text-[0.8125rem] leading-none font-semibold">
                  {summary.placed}
                  <span className="text-muted-foreground font-medium"> / {summary.required}</span>
                </p>
              </div>
            }
          />
          <TooltipContent>
            {done ? 'Все занятия расставлены' : `Расставлено ${summary.placed} из ${summary.required}`}
          </TooltipContent>
        </Tooltip>

        <span aria-hidden className="bg-hairline mx-0.5 h-5 w-px" />

        <div className="flex items-center gap-0.5">
          <ToolbarAction label="Отменить" hint="Отменить · Ctrl+Z" disabled={!canUndo} onClick={undo}>
            <Undo2 aria-hidden />
          </ToolbarAction>
          <ToolbarAction label="Вернуть" hint="Вернуть · Ctrl+Shift+Z" disabled={!canRedo} onClick={redo}>
            <Redo2 aria-hidden />
          </ToolbarAction>
          <ToolbarAction
            label="Вернуть исходные данные"
            hint="Вернуть исходные данные"
            onClick={resetToMock}
          >
            <RotateCcw aria-hidden />
          </ToolbarAction>
        </div>
      </div>
    </header>
  )
}
