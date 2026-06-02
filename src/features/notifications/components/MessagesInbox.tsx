import { MessageThread } from '@/features/notifications/components/MessageThread'
import type { UseCoachRepliesResult } from '@/features/notifications/hooks/useCoachReplies'

/*
 * MessagesInbox — the populated state of /messages.
 *
 * Coach-conversation-only: renders rich MessageThread cards for every
 * coach reply, grouped into UNREAD (with brand-green accent bar + NEW
 * pill + bg-unread tint) and EARLIER sections.
 *
 * The /messages route handles the loading + truly-empty states (with
 * the photographic MessagesEmptyState). This component assumes at least
 * one coach reply is present.
 *
 * No pagination footer here — /messages uses `useCoachReplies` which
 * fetches up to 100 notifications client-side filtered for coach
 * replies. For users with >100 total notifications, the route shows a
 * "Showing 100 most recent" footer below this list. Real coach-reply
 * pagination is blocked on a backend `?type=` filter (TODO).
 */
interface Props {
  replies: UseCoachRepliesResult
}

export function MessagesInbox({ replies }: Props) {
  return (
    <div className="space-y-8">
      {replies.unread.length > 0 && (
        <Section title="Unread">
          {replies.unread.map((notification) => (
            <li key={notification.id ?? notification.created_at}>
              <MessageThread notification={notification} />
            </li>
          ))}
        </Section>
      )}

      {replies.earlier.length > 0 && (
        <Section title="Earlier">
          {replies.earlier.map((notification) => (
            <li key={notification.id ?? notification.created_at}>
              <MessageThread notification={notification} />
            </li>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
        {title}
      </h2>
      <ul className="space-y-3">{children}</ul>
    </section>
  )
}
