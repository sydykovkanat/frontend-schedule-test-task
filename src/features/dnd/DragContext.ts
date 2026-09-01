import { createContext, use } from 'react'

import type { Placement, WeekDay } from '@/domain/types'

import type { DragSource } from './dragIds'

export interface DragContextValue {
  active: DragSource | null
  focusedSectionId: string | null
  highlightedSectionId: string | null
  hoveredSlotKey: string | null
  notice: string | null
  week: ReadonlyMap<string, Placement> | null
  placementAt: (day: WeekDay, timeSlotId: string) => Placement | undefined
  placeFocusedAt: (day: WeekDay, timeSlotId: string) => void
  focusSection: (sectionId: string | null) => void
  setNotice: (message: string | null) => void
}

export const DragContext = createContext<DragContextValue | null>(null)

export function useDragState(): DragContextValue {
  const value = use(DragContext)
  if (!value) throw new Error('useDragState доступен только внутри ScheduleDndProvider')
  return value
}
