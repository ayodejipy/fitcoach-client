import { Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'

import { BrandSurface } from '@/components/ui/BrandSurface'
import { Button } from '@/components/ui/button'

interface Props {
  submitted: boolean
  programWeek: number | null | undefined
  coachName?: string | null | undefined
}

export function ThisWeekCard({ submitted, programWeek, coachName }: Props) {
  const weekLabel = programWeek ? `Week ${programWeek}` : 'this week'

  if (submitted) {
    return (
      <BrandSurface tone="mint" padding="md" role="status">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--green-brand)]">
            This week
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11.5px] font-bold tracking-[0.04em] uppercase text-[color:var(--green-brand)] ring-1 ring-[color:var(--green-soft)]">
            <CheckCircle2 className="h-[14px] w-[14px]" strokeWidth={2.5} />
            Submitted
          </span>
        </div>
        <h3
          className="font-display text-[20px] lg:text-[22px] leading-[1.2] tracking-[-0.01em] text-foreground"
          style={{ fontVariationSettings: "'opsz' 26, 'SOFT' 50" }}
        >
          {weekLabel} check-in is locked in.
        </h3>
        <p className="mt-1.5 text-[13.5px] text-[color:var(--text-secondary)]">
          {coachName
            ? `${coachName} will reply within a day.`
            : 'Your coach will reply within a day.'}
        </p>
      </BrandSurface>
    )
  }

  return (
    <BrandSurface tone="mint" padding="md">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--green-brand)]">
          This week
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11.5px] font-bold tracking-[0.04em] uppercase text-[color:var(--green-brand)] ring-1 ring-[color:var(--green-soft)]">
          <span className="h-[6px] w-[6px] rounded-full bg-[color:var(--green-mid)]" aria-hidden />
          Due Sunday
        </span>
      </div>
      <h3
        className="font-display text-[20px] lg:text-[22px] leading-[1.2] tracking-[-0.01em] text-foreground"
        style={{ fontVariationSettings: "'opsz' 26, 'SOFT' 50" }}
      >
        Submit your {weekLabel} check-in.
      </h3>
      <p className="mt-1.5 text-[13.5px] text-[color:var(--text-secondary)]">
        Weight, energy, mood, sleep, notes. Takes 90 seconds.
      </p>
      <Button
        asChild
        size="lg"
        className="mt-4 h-[50px] w-full text-[15px] shadow-[0_3px_14px_rgba(26,122,74,.32)]"
      >
        <Link to="/check-in">Start check-in →</Link>
      </Button>
    </BrandSurface>
  )
}
