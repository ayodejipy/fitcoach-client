import { Link } from '@tanstack/react-router'

import { NAV_ITEMS } from '@/features/navigation/nav-items'
import { SidebarCoachCard } from '@/features/navigation/components/SidebarCoachCard'
import { useUnreadCoachRepliesCount } from '@/features/notifications/hooks/useUnreadCoachRepliesCount'
import { SidebarProfileMenu } from '@/features/profile/components/SidebarProfileMenu'
import { useMe } from '@/features/profile/hooks/useMe'

export function Sidebar() {
  const { count: unread } = useUnreadCoachRepliesCount()
  const { data: me } = useMe()

  return (
    <aside
      aria-label="Primary"
      className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-60 lg:flex-col lg:border-r"
      style={{
        background: 'var(--cream)',
        borderRightColor: 'var(--border-warm)',
      }}
    >
      <Link to="/dashboard" className="flex items-center gap-2 px-5 pt-7 pb-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-white font-bold text-[12px]"
          style={{ background: 'var(--green-deep)' }}
          aria-hidden
        >
          F
        </span>
        <span className="text-[15px] font-extrabold tracking-tight text-foreground">
          FitCoach
        </span>
      </Link>

      <div
        className="mt-6 px-5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)]"
        aria-hidden
      >
        Navigate
      </div>

      <nav className="mt-2 flex flex-col gap-0.5 px-3">
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
              className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] font-semibold text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--cream-soft)]"
              activeProps={{
                className:
                  'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] font-semibold text-[color:var(--green-brand)] bg-[color:var(--green-pale)]',
              }}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span
                  className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold leading-none text-white"
                  style={{ background: 'var(--green-brand)' }}
                  aria-hidden
                >
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {me?.coach_name && (
        <>
          <div
            className="mt-6 px-5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)]"
            aria-hidden
          >
            Coaching
          </div>
          <div className="mt-2">
            <SidebarCoachCard coachName={me?.coach_name} />
          </div>
        </>
      )}

      <div className="flex-1" />

      <div className="px-3 pb-4">
        <SidebarProfileMenu />
      </div>
    </aside>
  )
}
