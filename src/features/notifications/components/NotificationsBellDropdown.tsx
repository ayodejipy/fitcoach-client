import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'

import { NotificationsListContent } from '@/features/notifications/components/NotificationsListContent'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'

/*
 * NotificationsBellDropdown — desktop-only (lg+) bell trigger + anchored
 * popover containing the unified notifications inbox.
 *
 * Trigger: small circular bell button, red dot when there are any unread
 * notifications. Red dot count uses `useUnreadCount` (the dedicated
 * cheap `/unread-count` endpoint) for server-authoritative accuracy —
 * independent of whatever pages the user has loaded.
 *
 * Popover: anchored top-right under the bell (`top-full mt-2 right-0`),
 * 400px wide, max-h 640px with internal scroll. Closes on click-outside
 * + Escape (controlled-popover pattern mirrored from SidebarProfileMenu).
 *
 * Why not Sheet on desktop: Sheet slides from the viewport edge, which
 * fights the bell's anchored position. A real popover reads as the
 * pattern users expect (Linear/Stripe/Vercel/Gmail bell dropdowns).
 */
export function NotificationsBellDropdown() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { count: unread } = useUnreadCount()
  const hasUnread = unread > 0

  useEffect(() => {
    if (!open) return

    function onMouseDown(ev: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(ev.target as Node)
      ) {
        setOpen(false)
      }
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          hasUnread
            ? `Notifications, ${unread} new`
            : 'Notifications'
        }
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          'relative flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] bg-card text-[color:var(--text-secondary)] transition-colors hover:bg-muted',
          open
            ? 'border-2 border-[color:var(--green-brand)] text-[color:var(--green-brand)]'
            : 'border-border',
        ].join(' ')}
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

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 flex max-h-[640px] w-[400px] flex-col overflow-hidden rounded-[16px] border bg-card shadow-[0_4px_12px_rgba(15,36,24,.06),0_24px_48px_rgba(15,36,24,.16)]"
          style={{ borderColor: 'var(--border-warm)' }}
        >
          <NotificationsListContent onItemClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
