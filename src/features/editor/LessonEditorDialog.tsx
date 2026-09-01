import { Copy, Trash2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useMemo } from 'react'

import { Button } from '@/components/ui/Button'
import { ConflictList } from '@/components/ui/ConflictList'
import { findConflicts } from '@/domain/conflicts'
import { evaluateWeek } from '@/domain/placement'
import { cn } from '@/lib/cn'
import { useSchedule } from '@/state/ScheduleContext'

const fieldClassName =
  'squircle-md bg-background text-foreground shadow-soft w-full cursor-pointer border border-transparent px-2 py-2 text-xs font-semibold focus:border-foreground focus:outline-none'

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

  const conflicts = useMemo(() => {
    if (!lesson) return []
    return findConflicts(
      {
        sectionId: lesson.sectionId,
        day: lesson.day,
        timeSlotId: lesson.timeSlotId,
        teacherId: lesson.teacherId,
        roomId: lesson.roomId,
      },
      ruleContextFor(lesson.id),
    )
  }, [lesson, ruleContextFor])

  const teacherOptions = useMemo(() => {
    if (!lesson || !section) return []
    const ids = new Set([...section.allowedTeacherIds, lesson.teacherId])
    if (section.teacherId) ids.add(section.teacherId)

    return [...ids].map((teacherId) => {
      const blocking = findConflicts(
        { sectionId: lesson.sectionId, day: lesson.day, timeSlotId: lesson.timeSlotId, teacherId, roomId: lesson.roomId },
        ruleContextFor(lesson.id),
      ).filter((conflict) => conflict.code === 'TEACHER_BUSY' || conflict.code === 'TEACHER_BLOCKED')

      return {
        id: teacherId,
        label: index.teacherById.get(teacherId)?.name ?? teacherId,
        blocked: blocking.length > 0,
      }
    })
  }, [index.teacherById, lesson, ruleContextFor, section])

  const roomOptions = useMemo(() => {
    if (!lesson) return []
    return dataset.rooms.map((room) => {
      const blocking = findConflicts(
        { sectionId: lesson.sectionId, day: lesson.day, timeSlotId: lesson.timeSlotId, teacherId: lesson.teacherId, roomId: room.id },
        ruleContextFor(lesson.id),
      ).filter((conflict) => conflict.code === 'ROOM_BUSY' || conflict.code === 'ROOM_CAPACITY')

      return { id: room.id, label: `${room.name} · ${room.capacity} мест`, blocked: blocking.length > 0 }
    })
  }, [dataset.rooms, lesson, ruleContextFor])

  const duplicate = () => {
    if (!lesson) return
    const week = evaluateWeek(lesson.sectionId, ruleContextFor())
    const free = [...week.entries()].find(([, placement]) => placement.status === 'valid' && placement.assignment)

    if (!free) {
      onNotice('Свободного слота без конфликтов для копии не нашлось')
      return
    }

    const [key, placement] = free
    const [day, timeSlotId] = key.split('|')
    run({
      type: 'duplicate',
      lessonId: lesson.id,
      slot: { day: day as typeof lesson.day, timeSlotId },
      assignment: { teacherId: placement.assignment!.teacherId, roomId: placement.assignment!.roomId },
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
    <Dialog.Root open={lesson !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn(
            'squircle-2xl bg-muted shadow-lift fixed top-1/2 left-1/2 z-50 flex w-[min(24rem,calc(100vw-2rem))]',
            '-translate-x-1/2 -translate-y-1/2 flex-col gap-3 p-4',
          )}
        >
          {lesson && section ? (
            <>
              <header className="flex items-start gap-2">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <Dialog.Title className="font-mono text-sm font-bold tracking-tight">
                    {section.code}
                  </Dialog.Title>
                  <Dialog.Description className="text-muted-foreground text-xs">
                    {course?.name}
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <Button variant="ghost" size="iconSm" className="ml-auto" aria-label="Закрыть">
                    <X aria-hidden />
                  </Button>
                </Dialog.Close>
              </header>

              <p className="label-caps">
                {dayLabel}, {timeSlot?.start}–{timeSlot?.end} · {section.studentsCount} студентов
              </p>

              <label className="flex flex-col gap-1">
                <span className="label-caps">Преподаватель</span>
                <select
                  value={lesson.teacherId}
                  onChange={(event) => run({ type: 'reassign', lessonId: lesson.id, teacherId: event.target.value })}
                  className={fieldClassName}
                >
                  {teacherOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.blocked ? `${option.label} — занят` : option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="label-caps">Аудитория</span>
                <select
                  value={lesson.roomId}
                  onChange={(event) => run({ type: 'reassign', lessonId: lesson.id, roomId: event.target.value })}
                  className={fieldClassName}
                >
                  {roomOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.blocked ? `${option.label} — не подходит` : option.label}
                    </option>
                  ))}
                </select>
              </label>

              <ConflictList conflicts={conflicts} emptyMessage="Конфликтов нет" />

              <footer className="flex gap-1.5 pt-1">
                <Button size="sm" onClick={duplicate}>
                  <Copy aria-hidden />
                  Копировать
                </Button>
                <Button size="sm" variant="danger" onClick={remove}>
                  <Trash2 aria-hidden />
                  Убрать
                </Button>
              </footer>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
