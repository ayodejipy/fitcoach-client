import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * Textarea — shadcn primitive, polished to match Input.tsx (FitCoach Portal
 * mobile-first defaults).
 *
 *   - min-h-[112px] gives ~4 visible lines on mobile so the textarea reads
 *     as a multi-line input, not a tall single-line one.
 *   - text-base / md:text-sm — same iOS no-zoom rule as Input.
 *   - rounded-[10px] aligns with `--radius-md` (Input matches).
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[112px] w-full rounded-[10px] border border-input bg-background px-3 py-2.5 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
