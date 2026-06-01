import { Link } from '@tanstack/react-router'
import { Calendar, LogOut, Receipt } from 'lucide-react'

import { useLogout } from '@/features/auth/hooks/useLogout'
import { usePaymentSummary } from '@/features/payments/hooks/usePaymentSummary'

/*
 * ProfileMenuItems — the link list + sign-out button shown inside both
 * the desktop dropdown and the mobile Sheet.
 *
 * Items resolve to real routes only (per "no stub features" rule). Account
 * + Help & support from the mockup are deferred until those pages exist.
 *
 * Behavior:
 *   - Each route Link calls `onNavigate` after the click so the parent
 *     popover/sheet can close itself.
 *   - Sign-out calls `useLogout()` which fire-and-forgets the backend POST
 *     then clears tokens + navigates to /login.
 *   - Billing item shows an amber "N due" pill when there are outstanding
 *     invoices — pulled from the same `usePaymentSummary` the /payments
 *     hero band uses (one cached query covers both surfaces).
 *
 * Size variant tunes vertical spacing — `compact` for the dropdown, `roomy`
 * for the bottom Sheet where touch targets need to be 44px+.
 */
interface Props {
  onNavigate?: () => void
  size?: 'compact' | 'roomy'
}

export function ProfileMenuItems({
  onNavigate,
  size = 'compact',
}: Props) {
  const logout = useLogout()
  const summary = usePaymentSummary()
  const dueCount = summary.outstandingCount

  const rowClasses =
    size === 'compact'
      ? 'flex items-center gap-3 rounded-[10px] px-3 py-2 text-[13.5px] font-semibold text-[color:var(--text-secondary)] hover:bg-[color:var(--cream)]'
      : 'flex items-center gap-3 rounded-[12px] px-3 py-3 text-[14.5px] font-semibold text-[color:var(--text-secondary)] active:bg-[color:var(--cream)]'

  const signOutClasses =
    size === 'compact'
      ? 'flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-[13.5px] font-semibold text-[color:var(--red)] hover:bg-red-50'
      : 'flex w-full items-center gap-3 rounded-[12px] px-3 py-3 text-[14.5px] font-semibold text-[color:var(--red)] active:bg-red-50'

  const iconSize = size === 'compact' ? 'h-4 w-4' : 'h-[18px] w-[18px]'

  function handleNavigate() {
    onNavigate?.()
  }

  async function handleSignOut() {
    onNavigate?.()
    await logout()
  }

  return (
    <>
      <Link to="/payments" onClick={handleNavigate} className={rowClasses}>
        <Receipt className={iconSize} strokeWidth={2} />
        <span className="flex-1">Billing &amp; invoices</span>
        {dueCount > 0 && (
          <span
            className="inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.04em]"
            style={{
              background: 'rgba(255, 200, 61, .18)',
              color: 'var(--fire-3)',
            }}
          >
            {dueCount} due
          </span>
        )}
      </Link>

      <Link to="/sessions" onClick={handleNavigate} className={rowClasses}>
        <Calendar className={iconSize} strokeWidth={2} />
        <span className="flex-1">All sessions</span>
      </Link>

      <div
        aria-hidden
        className="my-1 mx-1 h-px"
        style={{ background: 'var(--border-warm)' }}
      />

      <button
        type="button"
        onClick={() => void handleSignOut()}
        className={signOutClasses}
      >
        <LogOut className={iconSize} strokeWidth={2} />
        <span>Sign out</span>
      </button>
    </>
  )
}
