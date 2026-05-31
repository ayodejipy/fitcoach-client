import type { ReactNode } from 'react'

/*
 * EmptyState — placeholder card used across the /progress page surfaces:
 *   - the whole page when the user has no check-ins yet
 *   - the photos section when no check-ins have photos attached
 *   - an error fallback when the check-ins query fails
 *
 * Lives in `features/progress/components` because all three callers are
 * progress-scoped. If a future feature (e.g. /messages) needs the same
 * visual, promote to `components/ui/EmptyState.tsx`.
 */
interface Props {
  icon: ReactNode
  title: string
  body: string
  /** Optional call-to-action — typically a `<Button asChild><Link/></Button>`. */
  cta?: ReactNode
}

export function EmptyState({ icon, title, body, cta }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed border-border bg-[color:var(--bg-surface-muted)] px-6 py-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-[color:var(--text-secondary)]">
        {icon}
      </div>
      <div>
        <p className="text-[15px] font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[13px] text-[color:var(--text-secondary)]">
          {body}
        </p>
      </div>
      {cta}
    </div>
  )
}
