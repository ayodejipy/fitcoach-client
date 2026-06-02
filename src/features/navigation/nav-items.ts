import { ClipboardCheck, Home, LineChart, MessageCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
