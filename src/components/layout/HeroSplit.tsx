import type { ReactNode } from 'react'

interface HeroSplitProps {
  brand: ReactNode
  form: ReactNode
  bodyBackground?: string
}

export function HeroSplit({
  brand,
  form,
  bodyBackground,
}: HeroSplitProps) {
  return (
    <div
      className="min-h-dvh lg:grid lg:grid-cols-[65fr_35fr]"
      style={bodyBackground ? { background: bodyBackground } : undefined}
    >
      <aside className="relative flex flex-col min-h-[280px] lg:min-h-dvh overflow-hidden">
        {brand}
      </aside>
      <main className="flex items-center justify-center px-6 py-10 lg:px-10 lg:py-12">
        {form}
      </main>
    </div>
  )
}
