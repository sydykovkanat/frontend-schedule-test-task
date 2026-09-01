import type { Lesson, SlotRef } from '@/domain/types'

export interface ScheduleState {
  lessons: Lesson[]
  sequence: number
}

export interface LessonAssignment {
  teacherId: string
  roomId: string
}

export type ScheduleAction =
  | { type: 'place'; sectionId: string; slot: SlotRef; assignment: LessonAssignment }
  | { type: 'move'; lessonId: string; slot: SlotRef; assignment: LessonAssignment }
  | { type: 'reassign'; lessonId: string; teacherId?: string; roomId?: string }
  | { type: 'duplicate'; lessonId: string; slot: SlotRef; assignment: LessonAssignment }
  | { type: 'remove'; lessonId: string }
  | { type: 'reset'; lessons: Lesson[] }

export function createScheduleState(lessons: readonly Lesson[]): ScheduleState {
  return { lessons: [...lessons], sequence: 0 }
}

function appendLesson(state: ScheduleState, lesson: Omit<Lesson, 'id'>): ScheduleState {
  const sequence = state.sequence + 1
  return {
    sequence,
    lessons: [...state.lessons, { id: `LN${sequence}`, ...lesson }],
  }
}

function patchLesson(
  state: ScheduleState,
  lessonId: string,
  patch: (lesson: Lesson) => Lesson,
): ScheduleState {
  if (!state.lessons.some((lesson) => lesson.id === lessonId)) return state
  return {
    ...state,
    lessons: state.lessons.map((lesson) => (lesson.id === lessonId ? patch(lesson) : lesson)),
  }
}

export function scheduleReducer(state: ScheduleState, action: ScheduleAction): ScheduleState {
  switch (action.type) {
    case 'place':
      return appendLesson(state, {
        sectionId: action.sectionId,
        teacherId: action.assignment.teacherId,
        roomId: action.assignment.roomId,
        day: action.slot.day,
        timeSlotId: action.slot.timeSlotId,
      })

    case 'move':
      return patchLesson(state, action.lessonId, (lesson) => ({
        ...lesson,
        teacherId: action.assignment.teacherId,
        roomId: action.assignment.roomId,
        day: action.slot.day,
        timeSlotId: action.slot.timeSlotId,
      }))

    case 'reassign':
      return patchLesson(state, action.lessonId, (lesson) => ({
        ...lesson,
        teacherId: action.teacherId ?? lesson.teacherId,
        roomId: action.roomId ?? lesson.roomId,
      }))

    case 'duplicate': {
      const source = state.lessons.find((lesson) => lesson.id === action.lessonId)
      if (!source) return state
      return appendLesson(state, {
        sectionId: source.sectionId,
        teacherId: action.assignment.teacherId,
        roomId: action.assignment.roomId,
        day: action.slot.day,
        timeSlotId: action.slot.timeSlotId,
      })
    }

    case 'remove': {
      if (!state.lessons.some((lesson) => lesson.id === action.lessonId)) return state
      return { ...state, lessons: state.lessons.filter((lesson) => lesson.id !== action.lessonId) }
    }

    case 'reset':
      return { ...state, lessons: [...action.lessons] }

    default:
      return state
  }
}
