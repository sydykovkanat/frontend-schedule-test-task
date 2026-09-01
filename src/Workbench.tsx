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
      <div className="grid min-h-0 flex-1 gap-x-10 gap-y-8 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <SectionsPanel />
        <div className="flex min-h-0 min-w-0 flex-col gap-3">
          <WeekGrid selectedLessonId={editingLessonId} onOpenLesson={onOpenLesson} />
          <StatusBar />
        </div>
      </div>

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
      <div className="mx-auto flex h-dvh w-full max-w-[110rem] flex-col gap-8 px-6 py-8 md:px-10">
        <Toolbar />
        <ScheduleDndProvider onRequestEdit={setEditingLessonId}>
          <Board editingLessonId={editingLessonId} onOpenLesson={setEditingLessonId} />
        </ScheduleDndProvider>
      </div>
    </TooltipProvider>
  )
}
