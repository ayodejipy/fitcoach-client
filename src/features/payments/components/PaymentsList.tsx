import { PaymentListItem } from '@/features/payments/components/PaymentListItem'
import {
  formatAmount,
  type PaymentTone,
} from '@/features/payments/utils/format-payment'
import type { ModelsPayment } from '@/lib/api/generated/types.gen'

/*
 * PaymentsList — the /payments page body. Splits payments into "Open"
 * (pending / sent / overdue) and "Paid" sections, each with a Fraunces
 * section heading + count subline.
 *
 * Section visibility:
 *   - Open section hides when nothing is owed.
 *   - Paid section hides when no paid history exists.
 * The route owns the "everything empty" case via its own EmptyState card.
 *
 * Pure composition. The route owns the data fetch + sorts (newest first).
 */

const OPEN_STATUSES = new Set(['pending', 'sent', 'overdue'])

interface Props {
  payments: ModelsPayment[]
}

export function PaymentsList({ payments }: Props) {
  const open: ModelsPayment[] = []
  const paid: ModelsPayment[] = []
  let openTotalCents = 0
  let paidTotalCents = 0
  let currency = 'USD'

  for (const payment of payments) {
    if (payment.currency) currency = payment.currency
    if (payment.status && OPEN_STATUSES.has(payment.status)) {
      open.push(payment)
      openTotalCents += payment.amount_cents ?? 0
    } else if (payment.status === 'paid') {
      paid.push(payment)
      paidTotalCents += payment.amount_cents ?? 0
    } else {
      // Unknown status — file under paid as quieter visual treatment.
      paid.push(payment)
    }
  }

  return (
    <div className="space-y-10">
      {open.length > 0 && (
        <Section
          title="Open invoices"
          subtitle={`${open.length} pending · ${formatAmount(
            openTotalCents,
            currency,
          )} owed`}
        >
          {open.map((payment) => (
            <PaymentListItem
              key={payment.id ?? payment.invoice_number ?? payment.created_at}
              payment={payment}
            />
          ))}
        </Section>
      )}

      {paid.length > 0 && (
        <Section
          title="Paid"
          subtitle={`${paid.length} ${
            paid.length === 1 ? 'invoice' : 'invoices'
          } · ${formatAmount(paidTotalCents, currency)} total`}
        >
          {paid.map((payment) => (
            <PaymentListItem
              key={payment.id ?? payment.invoice_number ?? payment.created_at}
              payment={payment}
            />
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2
          className="font-display text-[22px] lg:text-[24px] font-normal leading-tight tracking-tight text-foreground"
          style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 60" }}
        >
          {title}
        </h2>
        <span className="text-[12.5px] font-medium text-[color:var(--text-secondary)]">
          {subtitle}
        </span>
      </div>
      <ul className="space-y-3">{children}</ul>
    </section>
  )
}

// Re-export so the route can keep importing the helper type from this barrel
// if it needs to. Avoids a deep import to format-payment from the route.
export type { PaymentTone }
