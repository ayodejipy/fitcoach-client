/*
 * ProgressSkeleton — three stacked placeholder bars matching the height of
 * the trend cards. Renders during the initial `useCheckIns()` load so the
 * page doesn't pop in.
 */
export function ProgressSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-44 animate-pulse rounded-[14px] bg-muted" />
      <div className="h-44 animate-pulse rounded-[14px] bg-muted" />
      <div className="h-44 animate-pulse rounded-[14px] bg-muted" />
    </div>
  )
}
