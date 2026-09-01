import { beforeEach, describe, expect, it, vi } from 'vitest'

import { clearStoredLessons, loadStoredLessons, saveStoredLessons } from '@/state/persistence'
import { DATASET } from '@/test/fixtures'

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => void map.delete(key),
    setItem: (key, value) => void map.set(key, value),
  }
}

let storage: Storage

beforeEach(() => {
  storage = memoryStorage()
})

describe('persistence', () => {
  it('сохраняет и читает занятия', () => {
    saveStoredLessons(DATASET.lessons, storage)

    expect(loadStoredLessons(storage)).toEqual(DATASET.lessons)
  })

  it('пустое хранилище даёт null', () => {
    expect(loadStoredLessons(storage)).toBeNull()
  })

  it('битый JSON не роняет приложение', () => {
    storage.setItem('schedule.lessons.v1', '{ это не json')

    expect(loadStoredLessons(storage)).toBeNull()
  })

  it('данные не той формы отбрасываются', () => {
    storage.setItem('schedule.lessons.v1', JSON.stringify([{ id: 'X' }]))

    expect(loadStoredLessons(storage)).toBeNull()
  })

  it('очистка удаляет запись', () => {
    saveStoredLessons(DATASET.lessons, storage)
    clearStoredLessons(storage)

    expect(loadStoredLessons(storage)).toBeNull()
  })

  it('переполненное хранилище не ломает сохранение', () => {
    const failing = { ...memoryStorage(), setItem: vi.fn(() => { throw new Error('QuotaExceededError') }) } as Storage

    expect(() => saveStoredLessons(DATASET.lessons, failing)).not.toThrow()
  })

  it('отсутствие хранилища обрабатывается молча', () => {
    expect(loadStoredLessons(undefined)).toBeNull()
    expect(() => saveStoredLessons(DATASET.lessons, undefined)).not.toThrow()
  })
})
