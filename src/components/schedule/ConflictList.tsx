import { AlertTriangle, Check, XCircle } from 'lucide-react'

import type { Conflict } from '@/domain/types'
import { cn } from '@/lib/utils'

interface ConflictListProps {
  conflicts: readonly Conflict[]
  emptyMessage?: string
  className?: string
}

export function ConflictList({ conflicts, emptyMessage = 'Слот свободен', className }: ConflictListProps) {
  if (conflicts.length === 0) {
    return (
      <p className={cn('flex items-start gap-1.5 text-xs text-success', className)}>
        <Check className="mt-px size-3.5 shrink-0" aria-hidden />
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className={cn('flex flex-col gap-1', className)}>
      {conflicts.map((conflict) => (
        <li
          key={conflict.code}
          className={cn(
            'flex items-start gap-1.5 text-xs leading-snug',
            conflict.level === 'error' ? 'text-destructive' : 'text-warning',
          )}
        >
          {conflict.level === 'error' ? (
            <XCircle className="mt-px size-3.5 shrink-0" aria-hidden />
          ) : (
            <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
          )}
          {conflict.message}
        </li>
      ))}
    </ul>
  )
}
