import { useCallback, useEffect, useState } from 'react'

import type { ScheduleDataset } from '@/domain/types'

import { ScheduleLoadError, loadScheduleDataset } from './scheduleApi'

export type ScheduleDataStatus = 'loading' | 'ready' | 'error'

export interface ScheduleDataResult {
  status: ScheduleDataStatus
  dataset: ScheduleDataset | null
  error: string | null
  reload: () => void
}

function shouldSimulateFailure(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('fail') === '1'
}

function messageOf(error: unknown): string {
  if (error instanceof ScheduleLoadError) return error.message
  if (error instanceof Error) return error.message
  return 'Не удалось загрузить расписание'
}

export function useScheduleData(): ScheduleDataResult {
  const [status, setStatus] = useState<ScheduleDataStatus>('loading')
  const [dataset, setDataset] = useState<ScheduleDataset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setError(null)

    loadScheduleDataset({ signal: controller.signal, simulateFailure: shouldSimulateFailure() })
      .then((loaded) => {
        if (controller.signal.aborted) return
        setDataset(loaded)
        setStatus('ready')
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setError(messageOf(cause))
        setStatus('error')
      })

    return () => controller.abort()
  }, [attempt])

  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  return { status, dataset, error, reload }
}
