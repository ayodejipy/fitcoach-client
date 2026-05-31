import { ClipboardCheck, Home, LineChart, MessageCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/*
 * Navigation registry — single source of truth for the gated-app nav.
 *
 * Both `BottomNav` (mobile, <md) and `Sidebar` (desktop, md+) render this list.
 * Adding a tab here lights it up in both places — no duplicated arrays to drift.
 *
 * `to` matches a generated route literal. New tabs require the matching route
 * file to exist (otherwise the TanStack Router types reject the `to`).
 *
 * Order is intentional and matches Decision 9D:
 *   Home → Check-in → Progress → Messages.
 * That's also the IA hierarchy from Decision 1A — Home is the hub, Check-in
 * is the weekly verb, Progress is the long-term trend, Messages is the
 * always-on conversation.
 */

/** A NAV_ITEMS key. Nav components use this to look up live badge counts. */
export type NavKey = 'home' | 'check-in' | 'progress' | 'messages'

export interface NavItem {
  /** Stable identifier — used to map a runtime badge count back to its tab. */
  key: NavKey
  /** Route literal — must match the generated TanStack Router file route. */
  to: '/dashboard' | '/check-in' | '/progress' | '/messages'
  /** Short label shown under the icon (mobile) or beside it (desktop). */
  label: string
  /** ARIA label for the link — slightly more descriptive than the visible text. */
  ariaLabel: string
  /** lucide-react icon component. */
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'home',
    to: '/dashboard',
    label: 'Home',
    ariaLabel: 'Home',
    icon: Home,
  },
  {
    key: 'check-in',
    to: '/check-in',
    label: 'Check-in',
    ariaLabel: 'Weekly check-in',
    icon: ClipboardCheck,
  },
  {
    key: 'progress',
    to: '/progress',
    label: 'Progress',
    ariaLabel: 'Progress and trends',
    icon: LineChart,
  },
  {
    key: 'messages',
    to: '/messages',
    label: 'Messages',
    ariaLabel: 'Messages with your coach',
    icon: MessageCircle,
  },
]
