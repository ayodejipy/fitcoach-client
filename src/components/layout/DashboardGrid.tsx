import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface DashboardGridProps {
  hero: ReactNode
  children: ReactNode
  className?: string
}

export function DashboardGrid({ hero, children, className }: DashboardGridProps) {
  return (
    <div className={cn('space-y-6 lg:space-y-7', className)}>
      {hero}
      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">{children}</div>
    </div>
  )
}
