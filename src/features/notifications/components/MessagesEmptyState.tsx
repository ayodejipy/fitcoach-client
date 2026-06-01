import { Link } from '@tanstack/react-router'
import { ArrowRight, Bell, ClipboardCheck } from 'lucide-react'

import { firstWord } from '@/features/dashboard/utils/first-word'

interface Props {
  coachName: string | null | undefined
}

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1600&q=85"

const HERO_STYLE = {
  background: `
    linear-gradient(180deg, rgba(15,36,24,.10) 0%, rgba(15,36,24,.55) 100%),
    url('${HERO_IMAGE}') center 40% / cover no-repeat
  `,
} as const

export function MessagesEmptyState({ coachName }: Props) {
  const coachFirstName = firstWord(coachName) ?? 'your coach'
  const coachLabel = coachName ?? 'Your coach'

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)]">
        {/* Hero photograph */}
        <div
          className="relative flex h-[220px] items-end p-6 text-white lg:h-[300px] lg:p-8"
          style={HERO_STYLE}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-medium tracking-[0.04em] ring-1 ring-white/15 backdrop-blur-md">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--green-pale)] text-[10px] font-bold text-[color:var(--green-deep)]">
              {coachLabel.charAt(0).toUpperCase()}
            </span>
            {coachLabel} · Your coach
          </div>
        </div>

        {/* Body */}
        <div className="p-7 text-center lg:p-9">
          <h2
            className="font-display text-[28px] lg:text-[32px] font-normal leading-[1.15] tracking-[-0.01em] text-foreground"
            style={{ fontVariationSettings: "'opsz' 60, 'SOFT' 50" }}
          >
            This is where{' '}
            <em
              className="not-italic"
              style={{
                fontVariationSettings: "'opsz' 84, 'SOFT' 80",
                fontWeight: 400,
              }}
            >
              {coachFirstName} replies.
            </em>
          </h2>
          <p className="mx-auto mt-4 max-w-[420px] text-[14.5px] leading-[1.55] text-[color:var(--text-secondary)]">
            Your check-ins arrive in your coach's queue every Monday. When{' '}
            {coachFirstName} replies, you'll see it land here first — usually
            within a day.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--green-pale)] px-3.5 py-2 text-[12.5px] font-semibold text-[color:var(--green-brand)] ring-1 ring-[color:var(--green-soft)]">
            <Bell className="h-3.5 w-3.5" strokeWidth={2.5} />
            We'll nudge you the moment they reply.
          </div>
        </div>
      </section>

      {/* While you wait */}
      <section className="rounded-[16px] border border-border bg-[color:var(--bg-surface-muted)]/40 p-5 lg:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--green-pale)] text-[color:var(--green-brand)] ring-1 ring-[color:var(--green-soft)]">
            <ClipboardCheck className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold tracking-tight text-foreground">
              While you wait
            </h3>
            <p className="mt-1 text-[13.5px] leading-snug text-[color:var(--text-secondary)]">
              Get tomorrow's reply going by logging this week's check-in.{' '}
              {coachFirstName} reviews them in the order they arrive.
            </p>
            <Link
              to="/check-in"
              className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[color:var(--green-brand)] hover:underline"
            >
              Start check-in
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
