import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * Button — shadcn primitive, polished for FitCoach Portal mobile-first defaults.
 *
 * Mobile tap-target rule (Apple HIG / Material): primary actions are ≥44px tall.
 *   - default → h-11 (44px), the everyday primary CTA
 *   - lg      → h-12 (48px), the big "Submit check-in"-style button
 *   - sm      → h-9 (36px), kept for chip-like inline actions; below HIG but
 *                acceptable for clearly-secondary text-only buttons
 *   - icon    → h-10 w-10 (40px), tight squares for icon-only nav controls
 *
 * Touch feedback: `active:scale-[0.98]` gives a subtle "press" without a
 * dedicated `:active` color shift. Touch users see motion that confirms the
 * tap before the network round-trip lands.
 *
 * No `:hover` colors are changed here — those already exist and Tailwind's
 * hover variant respects `(hover: hover)` by default, so they don't stick
 * on touch.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
