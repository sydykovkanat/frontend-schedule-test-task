import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg text-[0.8125rem] font-semibold whitespace-nowrap transition-[background-color,color,box-shadow,opacity] duration-100 ease-schedule outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:not-aria-[haspopup]:scale-[0.98] active:not-aria-[haspopup]:opacity-90 disabled:pointer-events-none disabled:opacity-35 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-linear-to-b from-[#2b93ff] to-[var(--accent-solid)] text-primary-foreground shadow-ink hover:to-[var(--accent-solid-hover)]",
        outline:
          "bg-surface text-foreground shadow-raise hover:bg-fill aria-expanded:bg-fill",
        secondary:
          "bg-surface text-foreground shadow-raise hover:bg-fill aria-expanded:bg-fill",
        ghost:
          "text-muted-foreground hover:bg-fill hover:text-foreground aria-expanded:bg-fill aria-expanded:text-foreground",
        danger:
          "bg-danger-soft text-danger-ink hover:bg-danger-soft/70 hover:text-danger-ink",
        destructive:
          "bg-destructive text-destructive-foreground shadow-raise hover:opacity-90",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3.5",
        xs: "h-6 gap-1 rounded-md px-2 text-2xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-2.5 text-2xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 px-4 text-sm",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
