import { Copy, Trash2, X } from 'lucide-react'
import { useMemo } from 'react'

import { ConflictList } from '@/components/schedule/ConflictList'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { findConflicts } from '@/domain/conflicts'
import { FALLBACK_TONE } from '@/domain/palette'
import { evaluateWeek } from '@/domain/placement'
import type { ConflictCode, WeekDay } from '@/domain/types'
import { STUDENTS, plural } from '@/lib/plural'
import { useSchedule } from '@/state/ScheduleContext'

interface EditorOption {
  value: string
  label: string
}

interface LessonEditorDialogProps {
  lessonId: string | null
  onClose: () => void
  onNotice: (message: string) => void
}

export function LessonEditorDialog({ lessonId, onClose, onNotice }: LessonEditorDialogProps) {
  const { dataset, index, lessons, ruleContextFor, run } = useSchedule()

  const lesson = lessons.find((candidate) => candidate.id === lessonId) ?? null
  const section = lesson ? index.sectionById.get(lesson.sectionId) : undefined
  const course = section ? index.courseById.get(section.courseId) : undefined
  const tone = lesson ? (index.toneBySectionId.get(lesson.sectionId) ?? FALLBACK_TONE) : FALLBACK_TONE

  const conflictsFor = useMemo(() => {
    if (!lesson) return null
    return (teacherId: string, roomId: string) =>
      findConflicts(
        { sectionId: lesson.sectionId, day: lesson.day, timeSlotId: lesson.timeSlotId, teacherId, roomId },
        ruleContextFor(lesson.id),
      )
  }, [lesson, ruleContextFor])

  const conflicts = useMemo(
    () => (lesson && conflictsFor ? conflictsFor(lesson.teacherId, lesson.roomId) : []),
    [conflictsFor, lesson],
  )

  const teacherOptions = useMemo<EditorOption[]>(() => {
    if (!lesson || !section || !conflictsFor) return []
    const ids = new Set([...section.allowedTeacherIds, lesson.teacherId])
    if (section.teacherId) ids.add(section.teacherId)
    const blocking: ConflictCode[] = ['TEACHER_BUSY', 'TEACHER_BLOCKED']

    return [...ids].map((teacherId) => {
      const name = index.teacherById.get(teacherId)?.name ?? teacherId
      const busy = conflictsFor(teacherId, lesson.roomId).some((conflict) =>
        blocking.includes(conflict.code),
      )
      return { value: teacherId, label: busy ? `${name} — занят` : name }
    })
  }, [conflictsFor, index.teacherById, lesson, section])

  const roomOptions = useMemo<EditorOption[]>(() => {
    if (!lesson || !conflictsFor) return []
    const blocking: ConflictCode[] = ['ROOM_BUSY', 'ROOM_CAPACITY']

    return dataset.rooms.map((room) => {
      const label = `${room.name} · ${room.capacity} мест`
      const unfit = conflictsFor(lesson.teacherId, room.id).some((conflict) =>
        blocking.includes(conflict.code),
      )
      return { value: room.id, label: unfit ? `${label} — не подходит` : label }
    })
  }, [conflictsFor, dataset.rooms, lesson])

  const duplicate = () => {
    if (!lesson) return
    const week = evaluateWeek(lesson.sectionId, ruleContextFor())
    const free = [...week.entries()].find(
      ([, placement]) => placement.status === 'valid' && placement.assignment,
    )

    if (!free) {
      onNotice('Свободного слота без конфликтов для копии не нашлось')
      return
    }

    const [key, placement] = free
    const [day, timeSlotId] = key.split('|')
    if (!placement.assignment) return

    run({
      type: 'duplicate',
      lessonId: lesson.id,
      slot: { day: day as WeekDay, timeSlotId },
      assignment: { teacherId: placement.assignment.teacherId, roomId: placement.assignment.roomId },
    })

    const dayLabel = dataset.meta.weekDays.find((entry) => entry.id === day)?.label ?? day
    onNotice(`Копия ${section?.code} поставлена: ${dayLabel}, ${index.timeSlotById.get(timeSlotId)?.start}`)
    onClose()
  }

  const remove = () => {
    if (!lesson) return
    run({ type: 'remove', lessonId: lesson.id })
    onNotice(`${section?.code} возвращена в нераспределённые`)
    onClose()
  }

  const dayLabel = lesson ? dataset.meta.weekDays.find((entry) => entry.id === lesson.day)?.label : null
  const timeSlot = lesson ? index.timeSlotById.get(lesson.timeSlotId) : undefined

  return (
    <Dialog open={lesson !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} data-tone={tone} className="gap-3.5">
        {lesson && section ? (
          <>
            <DialogHeader className="pr-8">
              <DialogTitle className="flex items-center gap-2">
                <span aria-hidden className="bg-tone size-2.5 shrink-0 rounded-full" />
                <span className="text-tone-ink font-mono text-[1.0625rem] font-bold tracking-[-0.02em]">
                  {section.code}
                </span>
              </DialogTitle>
              <DialogDescription>{course?.name}</DialogDescription>
            </DialogHeader>

            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Закрыть"
                  className="absolute top-4 right-4"
                />
              }
            >
              <X aria-hidden />
            </DialogClose>

            <div className="bg-fill flex items-center gap-2 rounded-lg px-3 py-2.5 text-[0.6875rem] font-semibold">
              <span>{dayLabel}</span>
              <span aria-hidden className="bg-fill-active size-[3px] shrink-0 rounded-full" />
              <span className="tnum font-mono">
                {timeSlot?.start}–{timeSlot?.end}
              </span>
              <span aria-hidden className="bg-fill-active size-[3px] shrink-0 rounded-full" />
              <span className="tnum text-muted-foreground">
                {section.studentsCount} {plural(section.studentsCount, STUDENTS)}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="label-caps">Преподаватель</Label>
              <Select
                items={teacherOptions}
                value={lesson.teacherId}
                onValueChange={(teacherId) =>
                  teacherId && run({ type: 'reassign', lessonId: lesson.id, teacherId })
                }
              >
                <SelectTrigger aria-label="Преподаватель" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teacherOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="label-caps">Аудитория</Label>
              <Select
                items={roomOptions}
                value={lesson.roomId}
                onValueChange={(roomId) => roomId && run({ type: 'reassign', lessonId: lesson.id, roomId })}
              >
                <SelectTrigger aria-label="Аудитория" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roomOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ConflictList conflicts={conflicts} emptyMessage="Конфликтов нет" />

            <DialogFooter className="sm:justify-start">
              <Button variant="secondary" onClick={duplicate}>
                <Copy aria-hidden />
                Копировать
              </Button>
              <Button variant="danger" onClick={remove}>
                <Trash2 aria-hidden />
                Убрать
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
