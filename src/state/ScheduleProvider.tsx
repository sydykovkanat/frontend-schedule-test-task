import { type ReactNode, useCallback, useEffect, useMemo, useReducer } from 'react'

import { buildOccupancy, buildScheduleIndex } from '@/domain/indexes'
import { buildProgressMap, summarizeWeek } from '@/domain/progress'
import type { ScheduleDataset } from '@/domain/types'

import { ScheduleContext, type ScheduleContextValue } from './ScheduleContext'
import { canRedo, canUndo, createHistory, record, redo, undo, type History } from './history'
import { clearStoredLessons, loadStoredLessons, saveStoredLessons } from './persistence'
import { createScheduleState, scheduleReducer, type ScheduleAction, type ScheduleState } from './scheduleReducer'

type HistoryAction = { type: 'apply'; action: ScheduleAction } | { type: 'undo' } | { type: 'redo' }

function historyReducer(state: History<ScheduleState>, action: HistoryAction): History<ScheduleState> {
  switch (action.type) {
    case 'apply': {
      const next = scheduleReducer(state.present, action.action)
      return next === state.present ? state : record(state, next)
    }
    case 'undo':
      return undo(state)
    case 'redo':
      return redo(state)
    default:
      return state
  }
}

function initialHistory(dataset: ScheduleDataset): History<ScheduleState> {
  return createHistory(createScheduleState(loadStoredLessons() ?? dataset.lessons))
}

interface ScheduleProviderProps {
  dataset: ScheduleDataset
  children: ReactNode
}

export function ScheduleProvider({ dataset, children }: ScheduleProviderProps) {
  const [history, dispatch] = useReducer(historyReducer, dataset, initialHistory)

  const lessons = history.present.lessons
  const nextLessonId = `LN${history.present.sequence + 1}`
  const index = useMemo(() => buildScheduleIndex(dataset), [dataset])
  const occupancy = useMemo(() => buildOccupancy(lessons), [lessons])
  const progress = useMemo(() => buildProgressMap(lessons, dataset.sections), [lessons, dataset.sections])
  const summary = useMemo(() => summarizeWeek(lessons, dataset.sections), [lessons, dataset.sections])

  useEffect(() => {
    saveStoredLessons(lessons)
  }, [lessons])

  const ruleContextFor = useCallback(
    (excludeLessonId?: string) => ({ index, occupancy, lessons, excludeLessonId }),
    [index, occupancy, lessons],
  )

  const run = useCallback((action: ScheduleAction) => dispatch({ type: 'apply', action }), [])

  const resetToMock = useCallback(() => {
    clearStoredLessons()
    dispatch({ type: 'apply', action: { type: 'reset', lessons: [...dataset.lessons] } })
  }, [dataset.lessons])

  const value = useMemo<ScheduleContextValue>(
    () => ({
      dataset,
      index,
      lessons,
      nextLessonId,
      progress,
      summary,
      ruleContextFor,
      run,
      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),
      canUndo: canUndo(history),
      canRedo: canRedo(history),
      resetToMock,
    }),
    [dataset, index, lessons, nextLessonId, progress, summary, ruleContextFor, run, history, resetToMock],
  )

  return <ScheduleContext value={value}>{children}</ScheduleContext>
}
