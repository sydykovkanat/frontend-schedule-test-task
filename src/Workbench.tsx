import { useEffect, useState } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'

import { LessonEditorDialog } from '@/features/editor/LessonEditorDialog'
import { useDragState } from '@/features/dnd/DragContext'
import { ScheduleDndProvider } from '@/features/dnd/ScheduleDndProvider'
import { SectionsPanel } from '@/features/sections/SectionsPanel'
import { StatusBar } from '@/features/schedule/StatusBar'
import { WeekGrid } from '@/features/schedule/WeekGrid'
import { Toolbar } from '@/features/toolbar/Toolbar'
import { useSchedule } from '@/state/ScheduleContext'

function useUndoShortcuts() {
  const { undo, redo } = useSchedule()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [redo, undo])
}

interface BoardProps {
  editingLessonId: string | null
  onOpenLesson: (lessonId: string | null) => void
}

function Board({ editingLessonId, onOpenLesson }: BoardProps) {
  const { focusSection, focusedSectionId, setNotice } = useDragState()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (focusedSectionId) focusSection(null)
      setNotice(null)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [focusSection, focusedSectionId, setNotice])

  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col max-lg:overflow-hidden lg:flex-row">
        <SectionsPanel />
        <WeekGrid selectedLessonId={editingLessonId} onOpenLesson={onOpenLesson} />
      </main>

      <StatusBar />

      <LessonEditorDialog
        lessonId={editingLessonId}
        onClose={() => onOpenLesson(null)}
        onNotice={setNotice}
      />
    </>
  )
}

export function Workbench() {
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  useUndoShortcuts()

  return (
    <TooltipProvider>
      <div className="bg-surface flex h-dvh w-full flex-col overflow-hidden">
        <Toolbar onOpenLesson={setEditingLessonId} />
        <ScheduleDndProvider onRequestEdit={setEditingLessonId}>
          <Board editingLessonId={editingLessonId} onOpenLesson={setEditingLessonId} />
        </ScheduleDndProvider>
      </div>
    </TooltipProvider>
  )
}
