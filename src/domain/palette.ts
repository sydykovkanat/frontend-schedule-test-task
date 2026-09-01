import type { Course } from './types'

export const COURSE_TONES = [
  'blue',
  'indigo',
  'purple',
  'pink',
  'orange',
  'amber',
  'green',
  'teal',
  'brown',
] as const

export type CourseTone = (typeof COURSE_TONES)[number]

export const FALLBACK_TONE: CourseTone = 'blue'

export function buildToneMap(courses: readonly Course[]): ReadonlyMap<string, CourseTone> {
  return new Map(
    courses.map((course, position) => [course.id, COURSE_TONES[position % COURSE_TONES.length]]),
  )
}
