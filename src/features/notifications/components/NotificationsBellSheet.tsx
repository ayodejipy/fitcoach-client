import { useState } from 'react'
import { Bell } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { NotificationsListContent } from '@/features/notifications/components/NotificationsListContent'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'

/*
 * NotificationsBellSheet — mobile-only (<lg) bell trigger + bottom Sheet
 * containing the unified notifications inbox.
 *
 * Same trigger visual as the desktop dropdown (circular bell + red dot)
 * for cross-viewport consistency. On tap, the Sheet slides up from the
 * bottom — matches the established mobile-overlay pattern from
 * MobileProfileMenu.
 *
 * Sheet sizing: `max-h-[88vh]` so the user can still see the page above
 * (orientation), with internal scrolling inside NotificationsListContent.
 * Pull handle at the top + radix-managed Escape/scrim dismiss.
 */
export function NotificationsBellSheet() {
  const [open, setOpen] = useState(false)
  const { count: unread } = useUnreadCount()
  const hasUnread = unread > 0

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label={
              hasUnread
                ? `Notifications, ${unread} new`
                : 'Notifications'
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-border bg-card text-[color:var(--text-secondary)] transition-colors hover:bg-muted"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
            {hasUnread && (
              <span
                aria-hidden
                className="absolute top-2 right-[9px] block h-[9px] w-[9px] rounded-full border-2 border-card"
                style={{ background: 'var(--red)' }}
              />
            )}
          </button>
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="flex max-h-[88vh] flex-col rounded-t-[24px] border-t-0 bg-card p-0 lg:hidden"
        >
          {/*
           * Sheet primitive requires a Title for a11y. NotificationsListContent
           * renders its own visible header, so we satisfy radix with a
           * screen-reader-only title here.
           */}
          <SheetTitle className="sr-only">Notifications</SheetTitle>
          <SheetDescription className="sr-only">
            Inbox of coach replies, session reminders, and other updates.
          </SheetDescription>

          <div
            aria-hidden
            className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-[color:var(--text-muted)]/40"
          />

          <NotificationsListContent onItemClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
