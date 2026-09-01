import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'onCard' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'icon' | 'iconSm'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  onCard: 'bg-background text-foreground shadow-soft hover:bg-background/70 hover:shadow-none',
  outline: 'border border-border bg-background hover:bg-secondary',
  ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
  danger: 'bg-destructive-soft text-destructive hover:brightness-95',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  icon: 'size-10',
  iconSm: 'size-8',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ className, variant = 'onCard', size = 'md', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'squircle-md inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap',
        'transition-[background-color,opacity,filter] duration-150 ease-schedule',
        'disabled:pointer-events-none disabled:opacity-35',
        '[&_svg]:size-4 [&_svg]:shrink-0',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  )
}
