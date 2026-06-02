import { CheckCheck, Loader2 } from 'lucide-react'

import { NotificationsDropdownItem } from '@/features/notifications/components/NotificationsDropdownItem'
import { useMarkAllNotificationsRead } from '@/features/notifications/hooks/useMarkAllNotificationsRead'
import { useNotificationsFeed } from '@/features/notifications/hooks/useNotificationsFeed'

/*
 * NotificationsListContent — the inside of the bell dropdown (and the
 * mobile bell Sheet). Same content, different shell.
 *
 * Layout:
 *   - Sticky header: Inbox eyebrow + Fraunces "Notes from your inbox." +
 *     "{N} new · {M} items" subtitle + "Mark all read" link
 *   - Scrollable feed of NotificationsDropdownItem rows (chronological,
 *     newest first, no section grouping — read/unread state lives in
 *     the row treatment)
 *   - Footer: "Load more" button + pagination state, OR "You're all
 *     caught up" line, OR nothing for single-page inboxes
 *   - Empty state: small bell+check icon + "You're all caught up"
 *
 * The host (NotificationsBellDropdown or NotificationsBellSheet) controls
 * the dismiss behavior — this component just calls `onItemClick` after a
 * row Link click so the host can close.
 */
interface Props {
  onItemClick?: () => void
}

export function NotificationsListContent({ onItemClick }: Props) {
  const feed = useNotificationsFeed()
  const markAllRead = useMarkAllNotificationsRead()

  return (
    <div className="flex h-full flex-col">
      <Header
        unreadCount={feed.unreadCount}
        total={feed.total}
        loadedCount={feed.loadedCount}
        canMarkAll={feed.unreadCount > 0}
        isMarkingAll={markAllRead.isPending}
        onMarkAll={() => markAllRead.mutate({})}
      />

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {feed.isLoading ? (
          <SkeletonRows />
        ) : feed.items.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2">
            {feed.items.map((notification) => (
              <li key={notification.id ?? notification.created_at}>
                <NotificationsDropdownItem
                  notification={notification}
                  onNavigate={onItemClick}
                />
              </li>
            ))}
            <PaginationFooter
              loadedCount={feed.loadedCount}
              total={feed.total}
              hasNextPage={feed.hasNextPage}
              isFetchingNextPage={feed.isFetchingNextPage}
              onLoadMore={feed.fetchNextPage}
            />
          </ul>
        )}
      </div>
    </div>
  )
}

interface HeaderProps {
  unreadCount: number
  total: number
  loadedCount: number
  canMarkAll: boolean
  isMarkingAll: boolean
  onMarkAll: () => void
}

function Header({
  unreadCount,
  total,
  loadedCount,
  canMarkAll,
  isMarkingAll,
  onMarkAll,
}: HeaderProps) {
  const itemsLabel = `${total === 0 ? loadedCount : total} ${
    total === 1 ? 'item' : 'items'
  }`

  return (
    <div
      className="border-b bg-card px-5 pt-5 pb-4"
      style={{ borderColor: 'var(--border-warm)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
            Inbox
          </div>
          <h2
            className="mt-1 font-display text-[22px] font-light leading-tight text-foreground"
            style={{ fontVariationSettings: "'opsz' 60, 'SOFT' 40" }}
          >
            Notes from{' '}
            <em
              className="not-italic"
              style={{
                fontVariationSettings: "'opsz' 84, 'SOFT' 80",
                fontWeight: 400,
              }}
            >
              your inbox.
            </em>
          </h2>
        </div>
        {canMarkAll && (
          <button
            type="button"
            onClick={onMarkAll}
            disabled={isMarkingAll}
            className="shrink-0 text-[11.5px] font-semibold text-[color:var(--green-brand)] hover:underline disabled:opacity-60"
          >
            {isMarkingAll ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>
      <p className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-[color:var(--text-secondary)]">
        {unreadCount > 0 && (
          <>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] ring-1"
              style={{
                background: 'var(--green-pale)',
                color: 'var(--green-brand)',
                ['--tw-ring-color' as string]: 'var(--green-soft)',
              }}
            >
              <span
                className="h-1 w-1 rounded-full animate-pulse"
                style={{ background: 'var(--green-brand)' }}
                aria-hidden
              />
              {unreadCount} new
            </span>
            <span aria-hidden className="text-[color:var(--text-muted)]">
              ·
            </span>
          </>
        )}
        <span className="tabular-nums">{itemsLabel}</span>
      </p>
    </div>
  )
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-[12px] bg-muted"
        />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: 'var(--green-pale)', color: 'var(--green-brand)' }}
        aria-hidden
      >
        <CheckCheck className="h-6 w-6" strokeWidth={2} />
      </div>
      <p className="text-[14px] font-bold tracking-tight text-foreground">
        You're all caught up.
      </p>
      <p className="mt-1 text-[12.5px] text-[color:var(--text-muted)]">
        Notifications from your coach and program will land here.
      </p>
    </div>
  )
}

interface PaginationFooterProps {
  loadedCount: number
  total: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
}

function PaginationFooter({
  loadedCount,
  total,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: PaginationFooterProps) {
  if (hasNextPage) {
    return (
      <li className="pt-3">
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isFetchingNextPage}
          className="flex w-full items-center justify-center gap-2 rounded-full border bg-card px-4 py-2 text-[12px] font-bold shadow-[var(--shadow-card)] transition-colors hover:bg-[color:var(--cream)] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ borderColor: 'var(--border-warm)' }}
        >
          {isFetchingNextPage ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
              Loading…
            </>
          ) : (
            'Load more'
          )}
        </button>
        <p className="mt-2 text-center text-[10.5px] text-[color:var(--text-muted)] tabular-nums">
          Showing {loadedCount} of {total}
        </p>
      </li>
    )
  }

  if (loadedCount > 0 && total > 0 && loadedCount >= total) {
    // Only show "all caught up" footer when there was actual pagination
    // (>1 page existed). Single-page inboxes get no footer noise.
    if (total <= loadedCount && total > 20) {
      return (
        <li className="pt-3">
          <p className="text-center text-[10.5px] text-[color:var(--text-muted)]">
            You're all caught up.
          </p>
        </li>
      )
    }
  }

  return null
}
