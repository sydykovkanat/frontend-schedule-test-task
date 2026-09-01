import { AlertCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { useScheduleData } from '@/data/useScheduleData'
import { ScheduleProvider } from '@/state/ScheduleProvider'

import { Workbench } from './Workbench'

function LoadingScreen() {
  return (
    <div className="flex h-dvh flex-col gap-3 px-4 py-5 md:px-6" aria-busy="true" aria-label="Загрузка расписания">
      <div className="bg-muted squircle-lg h-10 w-64 animate-pulse" />
      <div className="grid flex-1 gap-3 lg:grid-cols-[20.5rem_minmax(0,1fr)]">
        <div className="bg-muted squircle-2xl animate-pulse" />
        <div className="bg-muted squircle-2xl animate-pulse" />
      </div>
    </div>
  )
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-dvh items-center justify-center p-6">
      <div className="squircle-2xl bg-muted flex max-w-sm flex-col items-start gap-3 p-5">
        <AlertCircle className="text-destructive size-6" aria-hidden />
        <h1 className="text-sm font-bold">Расписание не загрузилось</h1>
        <p className="text-muted-foreground text-xs leading-relaxed">{message}</p>
        <Button size="sm" variant="primary" onClick={onRetry}>
          <RefreshCw aria-hidden />
          Попробовать снова
        </Button>
      </div>
    </div>
  )
}

export function App() {
  const { status, dataset, error, reload } = useScheduleData()

  if (status === 'loading') return <LoadingScreen />
  if (status === 'error' || !dataset) {
    return <ErrorScreen message={error ?? 'Неизвестная ошибка'} onRetry={reload} />
  }

  return (
    <ScheduleProvider dataset={dataset}>
      <Workbench />
    </ScheduleProvider>
  )
}
