import { Check } from 'lucide-react'

import { SessionDateBlock } from '@/features/sessions/components/SessionDateBlock'
import { sessionRelativeLabel } from '@/features/sessions/utils/format-session'
import type { ModelsSession } from '@/lib/api/generated/types.gen'

/*
 * CompletedSessionRow — one past-session row on the /sessions page.
 *
 * Visual: quieter than UpcomingSessionRow. Plain white card with a soft
 * cream border, smaller `sm` date block, "Completed" checkmark badge on
 * the right instead of a Join CTA. Reads as supporting context — past
 * sessions exist for the program-arc story, not for action.
 */
interface Props {
  session: ModelsSession
}

export function CompletedSessionRow({ session }: Props) {
  if (!session.starts_at) return null

  const title =
    session.title?.trim() || (session.session_type ?? 'Coaching session')
  const relativeLabel = sessionRelativeLabel(session.starts_at)
  const durationLabel =
    session.duration_mins && session.duration_mins > 0
      ? `${session.duration_mins} min`
      : null

  const meta = [relativeLabel, durationLabel].filter(Boolean).join(' · ')

  return (
    <li className="flex items-center justify-between gap-4 rounded-[14px] border border-[color:var(--border-warm)] bg-card px-5 py-3.5">
      <div className="flex min-w-0 items-center gap-4 lg:gap-5">
        <SessionDateBlock startsAt={session.starts_at} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-bold tracking-tight text-foreground">
            {title}
          </p>
          <p className="mt-0.5 text-[12px] text-[color:var(--text-secondary)]">
            {meta}
          </p>
        </div>
      </div>
      <div className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-[color:var(--green-brand)]">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        Completed
      </div>
    </li>
  )
}
