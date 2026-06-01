import { format, isPast, parseISO } from 'date-fns'

/*
 * Payment formatting helpers — currency + dates + status presentation.
 *
 * formatAmount:
 *   Convert backend's `amount_cents` + `currency` (ISO 4217, e.g. "USD") into
 *   a locale-aware string. Falls back to "USD" when currency is missing.
 *   Uses Intl.NumberFormat because date-fns doesn't do money — that's an
 *   explicit exception to the "date-fns for formatting" rule, called out in
 *   the comment so future-me knows.
 *
 * formatDueDate:
 *   Format a YYYY-MM-DD into "Jun 5, 2026" — friendlier than the raw ISO.
 *
 * paymentStatusTone:
 *   Returns a brand-token color name + label for a given backend status.
 *   The portal currently treats unknown statuses as "neutral" gray.
 */

export function formatAmount(
  amountCents: number | undefined,
  currency: string | undefined,
): string {
  if (typeof amountCents !== 'number') return '—'
  const dollars = amountCents / 100
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(dollars)
  } catch {
    // Bad currency code → fall back to a plain dollar render.
    return `$${dollars.toFixed(2)}`
  }
}

export function formatDueDate(yyyymmdd: string | undefined): string {
  if (!yyyymmdd) return ''
  try {
    return format(parseISO(yyyymmdd), 'MMM d, yyyy')
  } catch {
    return yyyymmdd
  }
}

export interface PaymentTone {
  label: string
  /** Background tint CSS color. */
  background: string
  /** Foreground (text) CSS color. */
  foreground: string
}

/**
 * Map a backend `status` string to a friendly label + brand-token colors.
 * Unknown statuses get a neutral chip — they still display, just without a
 * loud color claim.
 */
export function paymentStatusTone(
  status: string | undefined,
  dueDate: string | undefined,
): PaymentTone {
  switch (status) {
    case 'paid':
      return {
        label: 'Paid',
        background: 'var(--green-pale)',
        foreground: 'var(--green-brand)',
      }
    case 'pending':
    case 'sent': {
      // A pending invoice with a due date in the past is effectively overdue
      // even if the backend hasn't marked it that way yet.
      if (dueDate && isOverdue(dueDate)) {
        return {
          label: 'Overdue',
          background: 'rgba(239, 68, 68, .12)',
          foreground: 'var(--red)',
        }
      }
      return {
        label: 'Pending',
        background: 'rgba(255, 200, 61, .18)',
        foreground: 'var(--fire-3)',
      }
    }
    case 'overdue':
      return {
        label: 'Overdue',
        background: 'rgba(239, 68, 68, .12)',
        foreground: 'var(--red)',
      }
    case 'refunded':
      return {
        label: 'Refunded',
        background: 'var(--bg-surface-muted)',
        foreground: 'var(--text-secondary)',
      }
    case 'failed':
      return {
        label: 'Failed',
        background: 'rgba(239, 68, 68, .12)',
        foreground: 'var(--red)',
      }
    default:
      return {
        label: status ? toTitleCase(status) : '—',
        background: 'var(--bg-surface-muted)',
        foreground: 'var(--text-secondary)',
      }
  }
}

function isOverdue(yyyymmdd: string): boolean {
  try {
    return isPast(parseISO(yyyymmdd))
  } catch {
    return false
  }
}

/**
 * Title-case a single-word backend enum value ("pending" → "Pending"). Used
 * by `paymentStatusTone` for unknown statuses AND by PaymentListItem for
 * the `payment_type` fallback when there's no description. Kept narrow on
 * purpose — for multi-word strings reach for a fuller library.
 */
export function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}
