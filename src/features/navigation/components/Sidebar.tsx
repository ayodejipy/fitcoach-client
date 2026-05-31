import { Link } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

import { NAV_ITEMS } from '@/features/navigation/nav-items'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'

/*
 * Sidebar — desktop-only (md+). Fixed to the left edge, full viewport height.
 *
 * Decision 9D: at md+ the bottom nav moves to a left sidebar; the four
 * destinations stay the same, the content column stays single-column and
 * capped at ~640px. No separate desktop redesign — same intent, different
 * presentation.
 *
 * Sign-out is anchored at the bottom of the sidebar with a subtle divider
 * above it — separates "where I go" from "leave the app". The mobile
 * equivalent will live behind a settings/account screen (later task), so
 * for now the only way to sign out on mobile is to size up to desktop.
 * Acceptable for v1 — we'll revisit when settings ships.
 *
 * Messages tab shows the actual unread count when > 0 — desktop has the
 * real estate for the number, where the mobile bar only shows a dot.
 */
export function Sidebar() {
  const logout = useLogout()
  const { count: unread } = useUnreadCount()

  return (
    <aside
      aria-label="Primary"
      className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-60 md:flex-col md:border-r md:border-border md:bg-card md:px-3 md:py-6"
    >
      <Link
        to="/dashboard"
        className="px-3 text-[18px] font-extrabold tracking-tight text-foreground"
      >
        FitCoach
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
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
              className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] font-semibold text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--bg-surface-muted)]"
              activeProps={{
                className:
                  'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] font-semibold text-[color:var(--green-brand)] bg-[color:var(--green-pale)]',
              }}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span
                  className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--red)] px-1.5 text-[11px] font-bold leading-none text-white"
                  aria-hidden
                >
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-3">
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] font-semibold text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--bg-surface-muted)]"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
