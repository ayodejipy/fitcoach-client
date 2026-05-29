import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/*
 * cn — the canonical shadcn className helper.
 *
 * Merges class strings with `clsx` (handles conditionals + falsy values),
 * then runs the result through `tailwind-merge` so conflicting Tailwind
 * utilities resolve to the last one (e.g. `cn('p-2', 'p-4')` → `'p-4'`).
 *
 * Used pervasively by every shadcn-derived component for variant + override
 * composition.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
