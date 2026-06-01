import { MessageThread } from '@/features/notifications/components/MessageThread'
import type { UseMessageThreadsResult } from '@/features/notifications/hooks/useMessageThreads'

interface Props {
  threads: UseMessageThreadsResult
}

export function MessagesInbox({ threads }: Props) {
  return (
    <div className="space-y-8">
      {threads.unread.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
            Unread
          </h2>
          <ul className="space-y-3">
            {threads.unread.map((notification) => (
              <li key={notification.id ?? notification.created_at}>
                <MessageThread notification={notification} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {threads.earlier.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
            Earlier
          </h2>
          <ul className="space-y-3">
            {threads.earlier.map((notification) => (
              <li key={notification.id ?? notification.created_at}>
                <MessageThread notification={notification} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
