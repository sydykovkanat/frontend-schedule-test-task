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
      className="mx-auto flex h-dvh w-full max-w-[110rem] flex-col gap-8 px-6 py-8 md:px-10"
      aria-busy="true"
      aria-label="Загрузка расписания"
    >
      <div className="flex items-end justify-between gap-10">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="grid flex-1 gap-x-10 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-9 w-full" />
          {Array.from({ length: 6 }).map((_, position) => (
            <Skeleton key={position} className="h-[6.25rem] w-full" />
          ))}
        </div>
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  )
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-dvh items-center justify-center p-6">
      <Alert className="max-w-md">
        <AlertCircle aria-hidden />
        <AlertTitle>Расписание не загрузилось</AlertTitle>
        <AlertDescription>
          {message}
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
            <RefreshCw aria-hidden />
            Попробовать снова
          </Button>
        </AlertDescription>
      </Alert>
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
