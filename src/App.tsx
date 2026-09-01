import { AlertCircle, RefreshCw } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useScheduleData } from '@/data/useScheduleData'
import { ScheduleProvider } from '@/state/ScheduleProvider'

import { Workbench } from './Workbench'

function LoadingScreen() {
  return (
    <div
      className="bg-canvas flex h-dvh w-full flex-col overflow-hidden"
      aria-busy="true"
      aria-label="Загрузка расписания"
    >
      <div className="border-hairline flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Skeleton className="size-8 rounded-[9px]" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-44" />
          <Skeleton className="h-2.5 w-56" />
        </div>
        <Skeleton className="ml-auto h-8 w-32 rounded-lg" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="bg-sidebar border-hairline flex shrink-0 flex-col gap-1.5 px-3 py-3 max-lg:h-[18rem] max-lg:border-b lg:w-[21.5rem] lg:border-r">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="mb-1.5 h-8 w-full" />
          {Array.from({ length: 5 }).map((_, position) => (
            <Skeleton key={position} className="h-[7.375rem] w-full rounded-xl" />
          ))}
        </div>
        <div className="bg-surface min-h-0 flex-1" />
      </div>

      <div className="bg-sidebar border-hairline h-10 shrink-0 border-t" />
    </div>
  )
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-canvas flex h-dvh items-center justify-center p-6">
      <div className="bg-surface shadow-float flex w-full max-w-sm flex-col gap-3 rounded-2xl p-4">
        <Alert>
          <AlertCircle aria-hidden />
          <AlertTitle>Расписание не загрузилось</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
        <Button variant="default" onClick={onRetry} className="self-start">
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
