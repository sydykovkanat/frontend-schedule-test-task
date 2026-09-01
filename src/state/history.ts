export interface History<T> {
  past: readonly T[]
  present: T
  future: readonly T[]
}

export const DEFAULT_HISTORY_LIMIT = 50

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [] }
}

export function canUndo<T>(history: History<T>): boolean {
  return history.past.length > 0
}

export function canRedo<T>(history: History<T>): boolean {
  return history.future.length > 0
}

export function record<T>(
  history: History<T>,
  present: T,
  limit: number = DEFAULT_HISTORY_LIMIT,
): History<T> {
  if (Object.is(history.present, present)) return history

  const past = [...history.past, history.present]
  return {
    past: past.length > limit ? past.slice(past.length - limit) : past,
    present,
    future: [],
  }
}

export function undo<T>(history: History<T>): History<T> {
  const previous = history.past.at(-1)
  if (previous === undefined) return history

  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  }
}

export function redo<T>(history: History<T>): History<T> {
  const [next, ...rest] = history.future
  if (next === undefined) return history

  return {
    past: [...history.past, history.present],
    present: next,
    future: rest,
  }
}
