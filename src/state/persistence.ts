import { storedLessonsSchema } from '@/data/scheduleSchema'
import type { Lesson } from '@/domain/types'

const STORAGE_KEY = 'schedule.lessons.v1'

function defaultStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export function loadStoredLessons(storage: Storage | undefined = defaultStorage()): Lesson[] | null {
  if (!storage) return null

  try {
    const stored = storage.getItem(STORAGE_KEY)
    if (!stored) return null

    const parsed = storedLessonsSchema.safeParse(JSON.parse(stored))
    return parsed.success ? (parsed.data as Lesson[]) : null
  } catch {
    return null
  }
}

export function saveStoredLessons(
  lessons: readonly Lesson[],
  storage: Storage | undefined = defaultStorage(),
): void {
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(lessons))
  } catch {
    return
  }
}

export function clearStoredLessons(storage: Storage | undefined = defaultStorage()): void {
  if (!storage) return

  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}
