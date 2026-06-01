import { Check, Clock } from 'lucide-react'

import {
  formatAmount,
  formatDueDate,
  paymentStatusTone,
  toTitleCase,
} from '@/features/payments/utils/format-payment'
import type { ModelsPayment } from '@/lib/api/generated/types.gen'

/*
 * PaymentListItem — one row on the /payments page.
 *
 * Post-redesign visual treatment:
 *   - Lifted card: rounded-[16px], cream-border, shadow-card, generous padding.
 *   - Icon circle on the left (Check = paid, Clock = pending/overdue) tinted
 *     to match the status color.
 *   - Fraunces amount on the right (tabular-nums, 22px).
 *   - Status chip on the far right.
 *
 * Section grouping (Open vs Paid) lives at the list level; this row just
 * renders one payment and lets `paymentStatusTone` choose the chip color.
 */
interface Props {
  payment: ModelsPayment
}

export function PaymentListItem({ payment }: Props) {
  const tone = paymentStatusTone(payment.status, payment.due_date)
  const isPaid = payment.status === 'paid'

  const description =
    payment.description?.trim() ||
    (payment.payment_type ? toTitleCase(payment.payment_type) : 'Invoice')

  const dateLine = isPaid
    ? payment.paid_at
      ? `Paid ${formatDueDate(payment.paid_at.slice(0, 10))}`
      : 'Paid'
    : payment.due_date
      ? `Due ${formatDueDate(payment.due_date)}`
      : ''

  const Icon = isPaid ? Check : Clock

  return (
    <li className="flex items-center justify-between gap-4 rounded-[16px] border border-[color:var(--border-warm)] bg-card px-5 py-4 shadow-[var(--shadow-card)]">
      <div className="flex min-w-0 items-center gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: tone.background, color: tone.foreground }}
          aria-hidden
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={isPaid ? 2.5 : 2} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold tracking-tight text-foreground">
            {description}
          </p>
          {(dateLine || payment.invoice_number) && (
            <p className="mt-0.5 text-[12.5px] text-[color:var(--text-secondary)]">
              {dateLine}
              {dateLine && payment.invoice_number && <> · </>}
              {payment.invoice_number && <>#{payment.invoice_number}</>}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 lg:gap-4">
        <p
          className="font-display text-[20px] lg:text-[22px] font-normal tabular-nums text-foreground"
          style={{ fontVariationSettings: "'opsz' 60, 'SOFT' 30" }}
        >
          {formatAmount(payment.amount_cents, payment.currency)}
        </p>
        <span
          className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]"
          style={{ background: tone.background, color: tone.foreground }}
        >
          {tone.label}
        </span>
      </div>
    </li>
  )
}
