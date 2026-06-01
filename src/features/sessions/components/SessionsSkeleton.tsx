/*
 * SessionsSkeleton — three placeholder bars sized to a SessionListItem so
 * the page doesn't reflow when the query settles.
 */
export function SessionsSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-16 animate-pulse rounded-[12px] bg-muted" />
      <div className="h-16 animate-pulse rounded-[12px] bg-muted" />
      <div className="h-16 animate-pulse rounded-[12px] bg-muted" />
    </div>
  )
}
