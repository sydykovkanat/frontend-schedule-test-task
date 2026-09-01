import { z } from 'zod'

const weekDaySchema = z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI'])
const roomTypeSchema = z.enum(['LECTURE', 'COMPUTER_LAB'])

const timeSlotSchema = z.object({
  id: z.string().min(1),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
})

const courseSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
})

const teacherSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
})

const roomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  type: roomTypeSchema,
})

const sectionSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  code: z.string().min(1),
  studentsCount: z.number().int().positive(),
  requiredLessonsPerWeek: z.number().int().positive(),
  teacherId: z.string().min(1).nullable(),
  allowedTeacherIds: z.array(z.string().min(1)),
  preferredRoomType: roomTypeSchema,
})

const teacherBlockedSlotSchema = z.object({
  teacherId: z.string().min(1),
  day: weekDaySchema,
  timeSlotId: z.string().min(1),
  reason: z.string().min(1),
})

const lessonSchema = z.object({
  id: z.string().min(1),
  sectionId: z.string().min(1),
  teacherId: z.string().min(1),
  roomId: z.string().min(1),
  day: weekDaySchema,
  timeSlotId: z.string().min(1),
})

export const scheduleDatasetSchema = z.object({
  meta: z.object({
    title: z.string(),
    version: z.number(),
    weekDays: z.array(z.object({ id: weekDaySchema, label: z.string().min(1) })).nonempty(),
  }),
  timeSlots: z.array(timeSlotSchema).nonempty(),
  courses: z.array(courseSchema).nonempty(),
  teachers: z.array(teacherSchema).nonempty(),
  rooms: z.array(roomSchema).nonempty(),
  sections: z.array(sectionSchema).nonempty(),
  teacherBlockedSlots: z.array(teacherBlockedSlotSchema),
  lessons: z.array(lessonSchema),
})

export const storedLessonsSchema = z.array(lessonSchema)
