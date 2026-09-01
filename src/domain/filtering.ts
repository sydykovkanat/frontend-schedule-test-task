import type { ScheduleIndex } from './indexes'
import type { Lesson, Section, SectionProgress, SectionStatus } from './types'

export interface SectionFilters {
  query: string
  teacherId: string | null
  roomId: string | null
  status: SectionStatus | null
}

export const NO_FILTERS: SectionFilters = {
  query: '',
  teacherId: null,
  roomId: null,
  status: null,
}

export interface SectionFilterDeps {
  index: ScheduleIndex
  lessons: readonly Lesson[]
  progress: ReadonlyMap<string, SectionProgress>
}

export function hasActiveFilters(filters: SectionFilters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.teacherId !== null ||
    filters.roomId !== null ||
    filters.status !== null
  )
}

function searchableText(section: Section, index: ScheduleIndex): string {
  const course = index.courseById.get(section.courseId)
  const teacher = section.teacherId ? index.teacherById.get(section.teacherId) : undefined
  return [section.code, course?.name, course?.code, teacher?.name, teacher?.shortName]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function sectionIdsInRoom(roomId: string, lessons: readonly Lesson[]): Set<string> {
  return new Set(
    lessons.filter((lesson) => lesson.roomId === roomId).map((lesson) => lesson.sectionId),
  )
}

export function filterSections(
  sections: readonly Section[],
  filters: SectionFilters,
  deps: SectionFilterDeps,
): Section[] {
  const query = filters.query.trim().toLowerCase()
  const roomSectionIds = filters.roomId ? sectionIdsInRoom(filters.roomId, deps.lessons) : null

  return sections.filter((section) => {
    if (filters.teacherId) {
      const teaches =
        section.teacherId === filters.teacherId ||
        section.allowedTeacherIds.includes(filters.teacherId)
      if (!teaches) return false
    }

    if (roomSectionIds && !roomSectionIds.has(section.id)) return false

    if (filters.status && deps.progress.get(section.id)?.status !== filters.status) return false

    if (query && !searchableText(section, deps.index).includes(query)) return false

    return true
  })
}
