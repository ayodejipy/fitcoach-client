import { forwardRef, type ReactNode, type HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export type BrandSurfaceTone = 'deep' | 'mint'
export type BrandSurfacePadding = 'md' | 'lg' | 'xl'

interface BrandSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  tone?: BrandSurfaceTone
  padding?: BrandSurfacePadding
  glow?: boolean
  children: ReactNode
}

const TONE_CLASSES: Record<BrandSurfaceTone, string> = {
  deep: 'bg-[var(--green-deep)] text-white shadow-[0_12px_36px_rgba(26,122,74,.22)]',
  mint: 'bg-gradient-to-br from-[color:var(--green-pale)] via-[#F3F9F5] to-white text-[color:var(--text-primary)] border border-[color:var(--green-soft)]',
}

const PADDING_CLASSES: Record<BrandSurfacePadding, string> = {
  md: 'p-5',
  lg: 'p-7',
  xl: 'p-7 lg:p-10',
}

export const BrandSurface = forwardRef<HTMLDivElement, BrandSurfaceProps>(
  ({ tone = 'deep', padding = 'lg', glow, className, children, ...rest }, ref) => {
    const showGlow = glow ?? tone === 'deep'

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-[22px]',
          TONE_CLASSES[tone],
          PADDING_CLASSES[padding],
          className,
        )}
        {...rest}
      >
        {showGlow && <RadialGlow tone={tone} />}
        {children}
      </div>
    )
  },
)
BrandSurface.displayName = 'BrandSurface'

/*
 * The radial accent. On `deep` it's a soft green-light circle in the bottom-
 * right corner. On `mint` it's a barely-there warmer circle in the top-left
 * (we use it less aggressively since mint surfaces already have a gradient).
 */
function RadialGlow({ tone }: { tone: BrandSurfaceTone }) {
  if (tone === 'mint') {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 -top-12 h-44 w-44"
        style={{
          background:
            'radial-gradient(circle at center, rgba(46,204,113,.10) 0%, transparent 60%)',
        }}
      />
    )
  }
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-10 -bottom-14 h-56 w-56"
      style={{
        background:
          'radial-gradient(circle at center, rgba(46,204,113,.15) 0%, transparent 65%)',
      }}
    />
  )
}
