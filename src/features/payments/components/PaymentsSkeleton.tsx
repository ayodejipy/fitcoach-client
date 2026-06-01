/*
 * PaymentsSkeleton — placeholder bars sized to a PaymentListItem so the
 * page doesn't reflow when the query settles. Mirrors SessionsSkeleton.
 */
export function PaymentsSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-16 animate-pulse rounded-[12px] bg-muted" />
      <div className="h-16 animate-pulse rounded-[12px] bg-muted" />
      <div className="h-16 animate-pulse rounded-[12px] bg-muted" />
    </div>
  )
}
