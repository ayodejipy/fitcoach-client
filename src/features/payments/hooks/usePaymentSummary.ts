import { useMemo } from 'react'
import { differenceInCalendarDays, getYear, parseISO } from 'date-fns'

import { usePayments } from '@/features/payments/hooks/usePayments'
import type { ModelsPayment } from '@/lib/api/generated/types.gen'

/*
 * usePaymentSummary — derive the 3 hero-band stats from the same paginated
 * payments query the list view consumes (no extra fetch).
 *
 *   - paidYtdCents / paidYtdCount — total + count of `status === 'paid'`
 *     payments whose `paid_at` is in the current calendar year.
 *   - outstandingCents / outstandingCount — total + count of pending|sent|
 *     overdue payments (statuses that mean "still owed").
 *   - nextDue — the earliest upcoming `due_date` among pending|sent that
 *     hasn't passed yet, with `daysUntil` for the "in N days" copy. Returns
 *     null when nothing's coming up.
 *
 * Currency: the backend allows mixed currencies in principle. The hero band
 * assumes a single dominant currency — we surface the currency of the most
 * recent payment so the formatter uses it. If a client has truly mixed
 * currencies the hero will under-count; that's a v1 known-gap, called out
 * here so future-me doesn't ship "$ + €" addition.
 */

const OPEN_STATUSES = new Set(['pending', 'sent', 'overdue'])

export interface PaymentSummary {
  isLoading: boolean
  paidYtdCents: number
  paidYtdCount: number
  outstandingCents: number
  outstandingCount: number
  nextDue:
    | {
        dueDate: string
        daysUntil: number
        amountCents: number
      }
    | null
  currency: string
}

export function usePaymentSummary(): PaymentSummary {
  const query = usePayments()

  return useMemo(() => {
    const payments: ModelsPayment[] = query.data?.payments ?? []

    if (payments.length === 0) {
      return {
        isLoading: query.isLoading,
        paidYtdCents: 0,
        paidYtdCount: 0,
        outstandingCents: 0,
        outstandingCount: 0,
        nextDue: null,
        currency: 'USD',
      }
    }

    const now = new Date()
    const currentYear = getYear(now)

    let paidYtdCents = 0
    let paidYtdCount = 0
    let outstandingCents = 0
    let outstandingCount = 0
    let nextDuePayment: ModelsPayment | null = null
    let nextDueDate: Date | null = null

    for (const payment of payments) {
      const amount = payment.amount_cents ?? 0

      if (payment.status === 'paid' && payment.paid_at) {
        const paidYear = safeYear(payment.paid_at)
        if (paidYear === currentYear) {
          paidYtdCents += amount
          paidYtdCount += 1
        }
      }

      if (payment.status && OPEN_STATUSES.has(payment.status)) {
        outstandingCents += amount
        outstandingCount += 1

        if (payment.due_date) {
          const dueDate = safeParse(payment.due_date)
          if (dueDate && dueDate >= now) {
            if (nextDueDate === null || dueDate < nextDueDate) {
              nextDueDate = dueDate
              nextDuePayment = payment
            }
          }
        }
      }
    }

    const currency = inferCurrency(payments)

    return {
      isLoading: query.isLoading,
      paidYtdCents,
      paidYtdCount,
      outstandingCents,
      outstandingCount,
      nextDue:
        nextDuePayment && nextDueDate
          ? {
              dueDate: nextDuePayment.due_date!,
              daysUntil: Math.max(
                0,
                differenceInCalendarDays(nextDueDate, now),
              ),
              amountCents: nextDuePayment.amount_cents ?? 0,
            }
          : null,
      currency,
    }
  }, [query.data, query.isLoading])
}

function safeParse(yyyymmdd: string): Date | null {
  try {
    const parsed = parseISO(yyyymmdd)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  } catch {
    return null
  }
}

function safeYear(rfc3339: string): number | null {
  const parsed = safeParse(rfc3339)
  return parsed ? getYear(parsed) : null
}

function inferCurrency(payments: ModelsPayment[]): string {
  for (const payment of payments) {
    if (payment.currency) return payment.currency
  }
  return 'USD'
}
