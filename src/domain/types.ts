export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI'
export type RoomType = 'LECTURE' | 'COMPUTER_LAB'

export interface TimeSlot {
  id: string
  start: string
  end: string
}

export interface Course {
  id: string
  code: string
  name: string
}

export interface Teacher {
  id: string
  name: string
  shortName: string
}

export interface Room {
  id: string
  name: string
  capacity: number
  type: RoomType
}

export interface Section {
  id: string
  courseId: string
  code: string
  studentsCount: number
  requiredLessonsPerWeek: number
  teacherId: string | null
  allowedTeacherIds: string[]
  preferredRoomType: RoomType
}

export interface TeacherBlockedSlot {
  teacherId: string
  day: WeekDay
  timeSlotId: string
  reason: string
}

export interface Lesson {
  id: string
  sectionId: string
  teacherId: string
  roomId: string
  day: WeekDay
  timeSlotId: string
}

export interface WeekDayMeta {
  id: WeekDay
  label: string
}

export interface ScheduleDataset {
  meta: {
    title: string
    version: number
    weekDays: WeekDayMeta[]
  }
  timeSlots: TimeSlot[]
  courses: Course[]
  teachers: Teacher[]
  rooms: Room[]
  sections: Section[]
  teacherBlockedSlots: TeacherBlockedSlot[]
  lessons: Lesson[]
}

export interface SlotRef {
  day: WeekDay
  timeSlotId: string
}

export type ConflictLevel = 'error' | 'warning'

export type ConflictCode =
  | 'SECTION_BUSY'
  | 'TEACHER_BUSY'
  | 'TEACHER_BLOCKED'
  | 'ROOM_BUSY'
  | 'ROOM_CAPACITY'
  | 'NO_FREE_TEACHER'
  | 'NO_FREE_ROOM'
  | 'ROOM_TYPE'
  | 'QUOTA_FULL'

export interface Conflict {
  code: ConflictCode
  level: ConflictLevel
  message: string
}

export interface Assignment {
  teacherId: string
  roomId: string
  teacherAuto: boolean
  roomAuto: boolean
}

export interface AssignmentLock {
  teacherId?: string | null
  roomId?: string | null
}

export type PlacementStatus = 'valid' | 'warning' | 'blocked'

export interface Placement {
  status: PlacementStatus
  conflicts: Conflict[]
  assignment: Assignment | null
}

export type SectionStatus = 'unassigned' | 'partial' | 'complete'

export interface SectionProgress {
  placed: number
  required: number
  status: SectionStatus
}
