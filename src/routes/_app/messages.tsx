import { createFileRoute } from '@tanstack/react-router'

import { PageShell } from '@/components/layout/PageShell'
import { MessagesEmptyState } from '@/features/notifications/components/MessagesEmptyState'
import { MessagesInbox } from '@/features/notifications/components/MessagesInbox'
import { MessagesLoadingSkeleton } from '@/features/notifications/components/MessagesLoadingSkeleton'
import { useCoachReplies } from '@/features/notifications/hooks/useCoachReplies'
import { firstWord } from '@/features/dashboard/utils/first-word'
import { useMe } from '@/features/profile/hooks/useMe'

export const Route = createFileRoute('/_app/messages')({
  component: MessagesPage,
})

function MessagesPage() {
  const { data: me } = useMe()
  const replies = useCoachReplies()
  const coachFirstName = firstWord(me?.coach_name) ?? 'your coach'

  if (replies.isLoading) {
    return (
      <PageShell size="narrow">
        <MessagesLoadingSkeleton />
      </PageShell>
    )
  }

  if (replies.total === 0) {
    return (
      <PageShell size="narrow">
        <header className="mb-6">
          <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
            Messages
          </div>
          <h1
            className="mt-2 font-display text-[32px] lg:text-[36px] font-light leading-[1.1] tracking-[-0.015em] text-foreground"
            style={{ fontVariationSettings: "'opsz' 84, 'SOFT' 40" }}
          >
            Talk to your{' '}
            <em
              className="not-italic"
              style={{
                fontVariationSettings: "'opsz' 100, 'SOFT' 80",
                fontWeight: 400,
              }}
            >
              coach.
            </em>
          </h1>
        </header>

        <MessagesEmptyState coachName={me?.coach_name} />
      </PageShell>
    )
  }

  const replyWord = replies.total === 1 ? 'reply' : 'replies'

  return (
    <PageShell size="narrow">
      <header className="mb-6">
        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
          Messages
        </div>
        <h1
          className="mt-2 font-display text-[32px] lg:text-[36px] font-light leading-[1.1] tracking-[-0.015em] text-foreground"
          style={{ fontVariationSettings: "'opsz' 84, 'SOFT' 40" }}
        >
          From{' '}
          <em
            className="not-italic"
            style={{
              fontVariationSettings: "'opsz' 100, 'SOFT' 80",
              fontWeight: 400,
            }}
          >
            {coachFirstName}.
          </em>
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-3 text-[13.5px] text-[color:var(--text-secondary)]">
          {replies.unread.length > 0 && (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--green-pale)] px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[color:var(--green-brand)] ring-1 ring-[color:var(--green-soft)]">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[color:var(--green-brand)] animate-pulse"
                  aria-hidden
                />
                {replies.unread.length} new
              </span>
              <span aria-hidden className="text-[color:var(--text-muted)]">
                ·
              </span>
            </>
          )}
          <span className="tabular-nums">
            {replies.total} {replyWord} total
          </span>
        </p>
      </header>

      <MessagesInbox replies={replies} />

      <p className="mt-8 text-center text-[12px] text-[color:var(--text-muted)]">
        {replies.capped
          ? `Showing 100 most recent notifications · older replies not loaded`
          : `Showing all ${replies.total} ${replyWord} · ${coachFirstName} reviews check-ins weekly`}
      </p>
    </PageShell>
  )
}
