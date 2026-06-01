export function MessagesLoadingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      <div className="h-10 w-64 animate-pulse rounded bg-muted" />
      <div className="mt-6 space-y-3">
        <div className="h-28 animate-pulse rounded-[16px] bg-muted" />
        <div className="h-28 animate-pulse rounded-[16px] bg-muted" />
        <div className="h-28 animate-pulse rounded-[16px] bg-muted" />
      </div>
    </div>
  )
}
