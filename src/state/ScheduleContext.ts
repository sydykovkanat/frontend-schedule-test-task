import { createContext, use } from 'react'

import type { LessonAudit } from '@/domain/audit'
import type { RuleContext } from '@/domain/conflicts'
import type { ScheduleIndex } from '@/domain/indexes'
import type { WeekSummary } from '@/domain/progress'
import type { Lesson, ScheduleDataset, SectionProgress } from '@/domain/types'

import type { ScheduleAction } from './scheduleReducer'

export interface ScheduleContextValue {
  dataset: ScheduleDataset
  index: ScheduleIndex
  lessons: readonly Lesson[]
  audit: LessonAudit
  nextLessonId: string
  progress: ReadonlyMap<string, SectionProgress>
  summary: WeekSummary
  ruleContextFor: (excludeLessonId?: string) => RuleContext
  run: (action: ScheduleAction) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  resetToMock: () => void
}

export const ScheduleContext = createContext<ScheduleContextValue | null>(null)

export function useSchedule(): ScheduleContextValue {
  const value = use(ScheduleContext)
  if (!value) throw new Error('useSchedule доступен только внутри ScheduleProvider')
  return value
}
