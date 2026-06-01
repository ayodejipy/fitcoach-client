import { format, parseISO } from 'date-fns'

import { formatAmount } from '@/features/payments/utils/format-payment'
import type { PaymentSummary } from '@/features/payments/hooks/usePaymentSummary'

/*
 * PaymentsSummaryHero — the 3-stat band at the top of /payments.
 *
 * Pure presentation. Reads pre-derived numbers from `usePaymentSummary`
 * (locked at the route level) so this component never touches the network.
 *
 * Background uses the mint BrandSurface gradient inline rather than
 * `<BrandSurface tone="mint">` because we want the 3-column divider lines
 * in `--green-soft` and the hero's internal spacing tuned tighter than the
 * default BrandSurface padding scale.
 */
interface Props {
  summary: PaymentSummary
}

export function PaymentsSummaryHero({ summary }: Props) {
  const nextDueLabel = formatNextDueRelative(summary.nextDue?.daysUntil)
  const nextDueDateLine = summary.nextDue
    ? format(parseISO(summary.nextDue.dueDate), 'EEE · MMM d, yyyy')
    : 'Nothing scheduled'

  return (
    <section
      className="rounded-[20px] p-6 lg:p-8 shadow-[var(--shadow-card)]"
      style={{
        background:
          'linear-gradient(180deg, var(--green-pale) 0%, #F4FBF7 100%)',
      }}
    >
      <div className="grid grid-cols-1 gap-6 divide-y divide-[color:var(--green-soft)] lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-y-0">
        <Cell
          eyebrow="Paid this year"
          value={formatAmount(summary.paidYtdCents, summary.currency)}
          sub={
            summary.paidYtdCount === 0
              ? 'No paid invoices yet'
              : `Across ${summary.paidYtdCount} ${
                  summary.paidYtdCount === 1 ? 'invoice' : 'invoices'
                }`
          }
        />
        <Cell
          eyebrow="Outstanding"
          value={formatAmount(summary.outstandingCents, summary.currency)}
          sub={
            summary.outstandingCount === 0
              ? 'Nothing pending'
              : `${summary.outstandingCount} ${
                  summary.outstandingCount === 1 ? 'invoice' : 'invoices'
                } pending`
          }
        />
        <Cell
          eyebrow="Next due"
          value={nextDueLabel}
          valueItalic={Boolean(summary.nextDue)}
          sub={nextDueDateLine}
        />
      </div>
    </section>
  )
}

function Cell({
  eyebrow,
  value,
  valueItalic = false,
  sub,
}: {
  eyebrow: string
  value: string
  valueItalic?: boolean
  sub: string
}) {
  return (
    <div className="px-0 py-4 first:pt-0 lg:px-6 lg:py-0 lg:first:pl-0 lg:last:pr-0">
      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--green-deep)]/70">
        {eyebrow}
      </div>
      <div
        className="mt-2 font-display text-[36px] lg:text-[44px] font-light leading-none tabular-nums text-[color:var(--green-deep)]"
        style={{
          fontVariationSettings: valueItalic
            ? "'opsz' 100, 'SOFT' 60"
            : "'opsz' 100, 'SOFT' 40",
          fontStyle: valueItalic ? 'italic' : 'normal',
        }}
      >
        {value}
      </div>
      <div className="mt-1 text-[12px] text-[color:var(--green-deep)]/70">
        {sub}
      </div>
    </div>
  )
}

function formatNextDueRelative(daysUntil: number | undefined): string {
  if (daysUntil === undefined) return '—'
  if (daysUntil === 0) return 'Today'
  if (daysUntil === 1) return 'Tomorrow'
  return `in ${daysUntil} days`
}
