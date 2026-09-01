import { Redo2, RotateCcw, Undo2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { useSchedule } from '@/state/ScheduleContext'

export function Toolbar() {
  const { summary, undo, redo, canUndo, canRedo, resetToMock } = useSchedule()

  return (
    <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-[1.75rem] leading-none font-bold tracking-[-0.025em]">Расписание секций</h1>
        <p className="text-muted-foreground text-sm">
          {summary.unassignedSections > 0
            ? `${summary.unassignedSections} секций ещё не начаты`
            : 'Все секции начаты'}
          {' · '}
          {summary.completeSections} из {summary.totalSections} закрыты полностью
        </p>
      </div>

      <div className="flex items-end gap-8">
        <p className="flex items-baseline gap-1.5">
          <span className="tnum font-mono text-[1.75rem] leading-none font-bold tracking-tight">
            {summary.placed}
          </span>
          <span className="tnum text-muted-foreground font-mono text-lg leading-none">
            / {summary.required}
          </span>
          <span className="text-muted-foreground ml-1 text-sm">занятий</span>
        </p>

        <div className="flex items-center gap-1 pb-0.5">
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} aria-label="Отменить" title="Отменить (Ctrl+Z)">
            <Undo2 aria-hidden />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} aria-label="Вернуть" title="Вернуть (Ctrl+Shift+Z)">
            <Redo2 aria-hidden />
          </Button>
          <Button variant="ghost" size="icon" onClick={resetToMock} aria-label="Вернуть исходные данные" title="Вернуть исходные данные">
            <RotateCcw aria-hidden />
          </Button>
        </div>
      </div>
    </header>
  )
}
