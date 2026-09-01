import type { ScheduleDataset } from '@/domain/types'

import raw from './schedule-mock-data.json'
import { scheduleDatasetSchema } from './scheduleSchema'

export class ScheduleLoadError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ScheduleLoadError'
  }
}

export interface LoadScheduleOptions {
  delayMs?: number
  simulateFailure?: boolean
  signal?: AbortSignal
}

const DEFAULT_DELAY_MS = 450

export function parseScheduleDataset(payload: unknown): ScheduleDataset {
  const parsed = scheduleDatasetSchema.safeParse(payload)
  if (!parsed.success) {
    throw new ScheduleLoadError('Не удалось прочитать данные расписания: формат файла не совпадает с ожидаемым', {
      cause: parsed.error,
    })
  }
  return parsed.data as ScheduleDataset
}

function wait(delayMs: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ScheduleLoadError('Загрузка расписания отменена'))
      return
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, delayMs)

    function onAbort() {
      clearTimeout(timer)
      reject(new ScheduleLoadError('Загрузка расписания отменена'))
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export async function loadScheduleDataset(options: LoadScheduleOptions = {}): Promise<ScheduleDataset> {
  const { delayMs = DEFAULT_DELAY_MS, simulateFailure = false, signal } = options

  await wait(delayMs, signal)

  if (simulateFailure) {
    throw new ScheduleLoadError('Сервер расписания недоступен. Попробуйте ещё раз')
  }

  return parseScheduleDataset(raw)
}
