import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * Input — shadcn primitive, polished for FitCoach Portal mobile-first defaults.
 *
 *   - h-11 (44px) on every viewport — matches the Button default tap target.
 *   - text-base (16px) on mobile prevents iOS Safari's "auto-zoom on focus"
 *     misfeature. Without this, every input focus throws the user into a
 *     zoomed-in viewport they then have to pinch-out of.
 *   - md:text-sm (14px) reverts to the desktop typographic scale.
 *   - rounded-[10px] matches `--radius-md` from tokens.css (cards use 14px,
 *     inputs are intentionally 10px — a tier smaller).
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[10px] border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
