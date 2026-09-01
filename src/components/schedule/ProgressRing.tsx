import { cn } from '@/lib/utils'

interface ProgressRingProps {
  value: number
  total: number
  size?: number
  className?: string
}

export function ProgressRing({ value, total, size = 22, className }: ProgressRingProps) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0
  const stroke = 2.5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const complete = ratio >= 1

  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('shrink-0 -rotate-90', className)}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        className="stroke-fill-active"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference * ratio} ${circumference}`}
        className={cn(
          'ease-schedule transition-all duration-300',
          complete ? 'stroke-ok' : 'stroke-brand',
        )}
      />
    </svg>
  )
}
