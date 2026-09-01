import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { type ReactNode, useCallback, useMemo, useState } from 'react'

import { slotKey } from '@/domain/keys'
import { evaluateWeek } from '@/domain/placement'
import type { Placement, WeekDay } from '@/domain/types'
import { useSchedule } from '@/state/ScheduleContext'

import { DragContext, type DragContextValue } from './DragContext'
import { DragPreview } from './DragPreview'
import {
  LESSON_PREFIX,
  SECTION_PREFIX,
  TRASH_DROPPABLE_ID,
  parseSlotDroppableId,
  type DragSource,
} from './dragIds'
import { gridCoordinateGetter } from './gridCoordinateGetter'

function parseDragSource(id: string, sectionIdOfLesson: (lessonId: string) => string | null): DragSource | null {
  if (id.startsWith(SECTION_PREFIX)) return { kind: 'section', sectionId: id.slice(SECTION_PREFIX.length) }
  if (id.startsWith(LESSON_PREFIX)) {
    const lessonId = id.slice(LESSON_PREFIX.length)
    const sectionId = sectionIdOfLesson(lessonId)
    return sectionId ? { kind: 'lesson', lessonId, sectionId } : null
  }
  return null
}

function firstReason(placement: Placement | undefined): string {
  return placement?.conflicts.at(0)?.message ?? 'Сюда поставить нельзя'
}

interface ScheduleDndProviderProps {
  onRequestEdit: (lessonId: string) => void
  children: ReactNode
}

export function ScheduleDndProvider({ onRequestEdit, children }: ScheduleDndProviderProps) {
  const { index, lessons, nextLessonId, progress, ruleContextFor, run } = useSchedule()

  const [active, setActive] = useState<DragSource | null>(null)
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null)
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: gridCoordinateGetter }),
  )

  const highlightedSectionId = active?.sectionId ?? focusedSectionId

  const week = useMemo(() => {
    if (!highlightedSectionId) return null
    const excludeLessonId = active?.kind === 'lesson' ? active.lessonId : undefined
    return evaluateWeek(highlightedSectionId, ruleContextFor(excludeLessonId))
  }, [highlightedSectionId, active, ruleContextFor])

  const placementAt = useCallback(
    (day: WeekDay, timeSlotId: string) => week?.get(slotKey(day, timeSlotId)),
    [week],
  )

  const sectionIdOfLesson = useCallback(
    (lessonId: string) => lessons.find((lesson) => lesson.id === lessonId)?.sectionId ?? null,
    [lessons],
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setNotice(null)
      setActive(parseDragSource(String(event.active.id), sectionIdOfLesson))
    },
    [sectionIdOfLesson],
  )

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const overId = event.over ? String(event.over.id) : null
    const slot = overId ? parseSlotDroppableId(overId) : null
    setHoveredSlotKey(slot ? slotKey(slot.day, slot.timeSlotId) : overId === TRASH_DROPPABLE_ID ? TRASH_DROPPABLE_ID : null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const source = parseDragSource(String(event.active.id), sectionIdOfLesson)
      setActive(null)
      setHoveredSlotKey(null)
      if (!source || !event.over) return

      const overId = String(event.over.id)
      const section = index.sectionById.get(source.sectionId)

      if (overId === TRASH_DROPPABLE_ID) {
        if (source.kind !== 'lesson') return
        run({ type: 'remove', lessonId: source.lessonId })
        setNotice(`${section?.code ?? 'Занятие'} возвращена в нераспределённые`)
        return
      }

      const slot = parseSlotDroppableId(overId)
      if (!slot) return

      const placement = week?.get(slotKey(slot.day, slot.timeSlotId))
      if (!placement || placement.status === 'blocked' || !placement.assignment) {
        setNotice(firstReason(placement))
        return
      }

      const assignment = { teacherId: placement.assignment.teacherId, roomId: placement.assignment.roomId }

      if (source.kind === 'section') {
        const createdId = nextLessonId
        run({ type: 'place', sectionId: source.sectionId, slot, assignment })
        setFocusedSectionId(null)
        if (placement.assignment.teacherAuto) onRequestEdit(createdId)
      } else {
        run({ type: 'move', lessonId: source.lessonId, slot, assignment })
      }

      setNotice(
        placement.status === 'warning'
          ? `${section?.code ?? 'Занятие'}: ${firstReason(placement)}`
          : null,
      )
    },
    [index.sectionById, nextLessonId, onRequestEdit, run, sectionIdOfLesson, week],
  )

  const placeFocusedAt = useCallback(
    (day: WeekDay, timeSlotId: string) => {
      if (!focusedSectionId || active) return

      const placement = week?.get(slotKey(day, timeSlotId))
      const section = index.sectionById.get(focusedSectionId)

      if (!placement || placement.status === 'blocked' || !placement.assignment) {
        setNotice(firstReason(placement))
        return
      }

      const createdId = nextLessonId
      run({
        type: 'place',
        sectionId: focusedSectionId,
        slot: { day, timeSlotId },
        assignment: {
          teacherId: placement.assignment.teacherId,
          roomId: placement.assignment.roomId,
        },
      })

      const current = progress.get(focusedSectionId)
      if (current && current.placed + 1 >= current.required) setFocusedSectionId(null)

      if (placement.assignment.teacherAuto) onRequestEdit(createdId)

      setNotice(
        placement.status === 'warning'
          ? `${section?.code ?? 'Занятие'}: ${firstReason(placement)}`
          : null,
      )
    },
    [active, focusedSectionId, index.sectionById, nextLessonId, onRequestEdit, progress, run, week],
  )

  const handleDragCancel = useCallback(() => {
    setActive(null)
    setHoveredSlotKey(null)
  }, [])

  const announcements = useMemo<Announcements>(
    () => ({
      onDragStart: ({ active: dragged }) => {
        const source = parseDragSource(String(dragged.id), sectionIdOfLesson)
        const code = source ? index.sectionById.get(source.sectionId)?.code : null
        return `Взяли ${code ?? 'элемент'}. Стрелками выберите слот, пробелом поставьте.`
      },
      onDragOver: ({ over }) => {
        if (!over) return 'Вне сетки расписания'
        if (String(over.id) === TRASH_DROPPABLE_ID) return 'Зона возврата в нераспределённые'
        const slot = parseSlotDroppableId(String(over.id))
        if (!slot) return undefined
        const placement = week?.get(slotKey(slot.day, slot.timeSlotId))
        const dayLabel = index.dataset.meta.weekDays.find((day) => day.id === slot.day)?.label ?? slot.day
        const time = index.timeSlotById.get(slot.timeSlotId)?.start ?? ''
        if (placement?.status === 'blocked') return `${dayLabel}, ${time}. Нельзя: ${firstReason(placement)}`
        if (placement?.status === 'warning') return `${dayLabel}, ${time}. Можно, но ${firstReason(placement)}`
        return `${dayLabel}, ${time}. Свободно`
      },
      onDragEnd: ({ over }) => (over ? 'Готово' : 'Отменено'),
      onDragCancel: () => 'Отменено',
    }),
    [index, sectionIdOfLesson, week],
  )

  const value = useMemo<DragContextValue>(
    () => ({
      active,
      focusedSectionId,
      highlightedSectionId,
      hoveredSlotKey,
      notice,
      week: week ?? null,
      placementAt,
      placeFocusedAt,
      focusSection: setFocusedSectionId,
      setNotice,
    }),
    [
      active,
      focusedSectionId,
      highlightedSectionId,
      hoveredSlotKey,
      notice,
      week,
      placementAt,
      placeFocusedAt,
    ],
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      accessibility={{ announcements }}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <DragContext value={value}>
        {children}
        <DragOverlay dropAnimation={null}>{active ? <DragPreview source={active} /> : null}</DragOverlay>
      </DragContext>
    </DndContext>
  )
}
