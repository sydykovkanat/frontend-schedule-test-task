import { Redo2, RotateCcw, Undo2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
          <Button variant="ghost" size="icon" aria-label={label} disabled={disabled} onClick={onClick}>
            {children}
          </Button>
        }
      />
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}

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

      <div className="flex items-center gap-5">
        <p className="flex items-baseline gap-1.5">
          <span className="tnum font-mono text-[1.75rem] leading-none font-bold tracking-tight">
            {summary.placed}
          </span>
          <span className="tnum text-muted-foreground font-mono text-lg leading-none">
            / {summary.required}
          </span>
          <span className="text-muted-foreground ml-1 text-sm">занятий</span>
        </p>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          <ToolbarAction label="Отменить" hint="Отменить · Ctrl+Z" disabled={!canUndo} onClick={undo}>
            <Undo2 aria-hidden />
          </ToolbarAction>
          <ToolbarAction label="Вернуть" hint="Вернуть · Ctrl+Shift+Z" disabled={!canRedo} onClick={redo}>
            <Redo2 aria-hidden />
          </ToolbarAction>
          <ToolbarAction label="Вернуть исходные данные" hint="Вернуть исходные данные" onClick={resetToMock}>
            <RotateCcw aria-hidden />
          </ToolbarAction>
        </div>
      </div>
    </header>
  )
}
