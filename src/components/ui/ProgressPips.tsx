import { cn } from '@/lib/cn'

interface ProgressPipsProps {
  placed: number
  required: number
  complete?: boolean
  className?: string
}

export function ProgressPips({ placed, required, complete = false, className }: ProgressPipsProps) {
  const pips = Array.from({ length: Math.max(required, placed) })

  return (
    <span className={cn('flex gap-1', className)} aria-hidden>
      {pips.map((_, position) => (
        <span
          key={position}
          className={cn(
            'h-[3px] flex-1 rounded-full transition-colors duration-200 ease-schedule',
            position < placed ? (complete ? 'bg-success' : 'bg-foreground') : 'bg-border',
          )}
        />
      ))}
    </span>
  )
}
