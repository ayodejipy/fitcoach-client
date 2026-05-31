import { Link } from '@tanstack/react-router'

import { NAV_ITEMS } from '@/features/navigation/nav-items'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'

/*
 * BottomNav — mobile-only (<md). Fixed to the bottom of the viewport.
 *
 * Decision 9D pins this as the mobile nav pattern; the desktop counterpart
 * is Sidebar.tsx. Both render the same NAV_ITEMS list so adding a tab in
 * one place lights it up everywhere.
 *
 * Active state uses TanStack Router's <Link activeProps> — the router knows
 * the current location, so we don't have to plumb it manually. Brand green
 * for active, muted for inactive. Tap target is the full tab cell (44x44+
 * per Apple HIG) — height is 78px including the safe-area gutter handled
 * in `_app.tsx`.
 *
 * The Messages tab shows a small red dot when unread > 0 (T8). The count
 * itself isn't shown on mobile — the dot is the nudge, the number lives on
 * the bell + the /messages page.
 */
export function BottomNav() {
  const { count: unread } = useUnreadCount()

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex h-[78px] items-stretch justify-around border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const showBadge = item.key === 'messages' && unread > 0
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-label={
              showBadge
                ? `${item.ariaLabel}, ${unread} unread`
                : item.ariaLabel
            }
            className="flex flex-1 flex-col items-center justify-center gap-1 px-2 text-[color:var(--text-muted)] transition-colors"
            activeProps={{
              className:
                'flex flex-1 flex-col items-center justify-center gap-1 px-2 text-[color:var(--green-brand)] transition-colors',
            }}
          >
            <span className="relative">
              <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
              {showBadge && (
                <span
                  aria-hidden
                  className="absolute -top-0.5 -right-1 block h-[9px] w-[9px] rounded-full border-2 border-card bg-[color:var(--red)]"
                />
              )}
            </span>
            <span className="text-[11px] font-semibold tracking-[0.01em]">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
