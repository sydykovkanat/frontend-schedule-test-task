import type { Lesson, Section, SectionProgress, SectionStatus } from './types'

export interface WeekSummary {
  placed: number
  required: number
  totalSections: number
  completeSections: number
  unassignedSections: number
}

function statusOf(placed: number, required: number): SectionStatus {
  if (placed === 0) return 'unassigned'
  return placed >= required ? 'complete' : 'partial'
}

export function buildProgressMap(
  lessons: readonly Lesson[],
  sections: readonly Section[],
): Map<string, SectionProgress> {
  const placedBySection = new Map<string, number>()
  for (const lesson of lessons) {
    placedBySection.set(lesson.sectionId, (placedBySection.get(lesson.sectionId) ?? 0) + 1)
  }

  return new Map(
    sections.map((section) => {
      const placed = placedBySection.get(section.id) ?? 0
      return [
        section.id,
        { placed, required: section.requiredLessonsPerWeek, status: statusOf(placed, section.requiredLessonsPerWeek) },
      ]
    }),
  )
}

export function summarizeWeek(
  lessons: readonly Lesson[],
  sections: readonly Section[],
): WeekSummary {
  const progress = buildProgressMap(lessons, sections)
  let placed = 0
  let required = 0
  let completeSections = 0
  let unassignedSections = 0

  for (const entry of progress.values()) {
    placed += entry.placed
    required += entry.required
    if (entry.status === 'complete') completeSections += 1
    if (entry.status === 'unassigned') unassignedSections += 1
  }

  return { placed, required, totalSections: progress.size, completeSections, unassignedSections }
}
