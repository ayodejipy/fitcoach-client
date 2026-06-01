import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Receipt } from 'lucide-react'

import { PageShell } from '@/components/layout/PageShell'
import { EmptyState } from '@/features/progress/components/EmptyState'
import { PaymentsList } from '@/features/payments/components/PaymentsList'
import { PaymentsSkeleton } from '@/features/payments/components/PaymentsSkeleton'
import { PaymentsSummaryHero } from '@/features/payments/components/PaymentsSummaryHero'
import { usePayments } from '@/features/payments/hooks/usePayments'
import { usePaymentSummary } from '@/features/payments/hooks/usePaymentSummary'

export const Route = createFileRoute('/_app/payments')({
  component: PaymentsPage,
})

function PaymentsPage() {
  const query = usePayments()
  const summary = usePaymentSummary()

  const orderedPayments = useMemo(() => {
    const rawPayments = query.data?.payments ?? []
    return [...rawPayments].sort((earlier, later) => {
      const earlierTime = earlier.created_at
        ? new Date(earlier.created_at).getTime()
        : 0
      const laterTime = later.created_at
        ? new Date(later.created_at).getTime()
        : 0
      return laterTime - earlierTime
    })
  }, [query.data])

  return (
    <PageShell size="medium">
      <header className="mb-8">
        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
          Billing
        </div>
        <h1
          className="mt-2 font-display text-[34px] lg:text-[44px] font-light leading-[1.1] tracking-[-0.015em] text-foreground"
          style={{ fontVariationSettings: "'opsz' 100, 'SOFT' 40" }}
        >
          Your{' '}
          <em
            className="not-italic"
            style={{
              fontVariationSettings: "'opsz' 108, 'SOFT' 80",
              fontWeight: 400,
            }}
          >
            invoices.
          </em>
        </h1>
        <p className="mt-3 text-[14px] text-[color:var(--text-secondary)]">
          Everything your coach has invoiced you.
        </p>
      </header>

      {query.isLoading ? (
        <PaymentsSkeleton />
      ) : query.isError ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" strokeWidth={1.8} />}
          title="Couldn't load billing"
          body="Try refreshing the page in a moment."
        />
      ) : orderedPayments.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-7 w-7" strokeWidth={1.8} />}
          title="No invoices yet"
          body="Your coach hasn't sent any invoices. New invoices will appear here."
        />
      ) : (
        <div className="space-y-8 lg:space-y-10">
          <PaymentsSummaryHero summary={summary} />
          <PaymentsList payments={orderedPayments} />
        </div>
      )}
    </PageShell>
  )
}
