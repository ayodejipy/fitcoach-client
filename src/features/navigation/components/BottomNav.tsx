import { Link } from '@tanstack/react-router'

import { NAV_ITEMS } from '@/features/navigation/nav-items'
import { useUnreadCoachRepliesCount } from '@/features/notifications/hooks/useUnreadCoachRepliesCount'

export function BottomNav() {
  const { count: unread } = useUnreadCoachRepliesCount()

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex h-[78px] items-stretch justify-around border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
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
