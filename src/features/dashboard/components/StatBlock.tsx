/*
 * StatBlock — one cell of the dashboard's "This week at a glance" 3-up
 * stat strip. Renders a value (Fraunces tabular-nums) over a small uppercase
 * label, with an optional suffix ("/10") and an optional vertical divider
 * border on the sides (used to separate the middle column).
 *
 * Kept separate from ThisWeekAtAGlance to follow the one-component-per-file
 * rule. Could be reused by future stat-grid surfaces (e.g. a Progress hero
 * band) without changes.
 */
interface Props {
  label: string
  value: number | null
  suffix?: string
  divider?: boolean
  formatValue?: (value: number) => string
}

export function StatBlock({
  label,
  value,
  suffix,
  divider,
  formatValue = (numericValue) => String(numericValue),
}: Props) {
  return (
    <div
      className={
        'text-center' +
        (divider ? ' border-x border-[color:var(--border-muted)]' : '')
      }
    >
      <div
        className="font-display text-[28px] leading-none tracking-tight text-foreground tabular-nums"
        style={{ fontVariationSettings: "'opsz' 36, 'SOFT' 40" }}
      >
        {value === null ? (
          <span className="text-[color:var(--text-muted)]">—</span>
        ) : (
          <>
            {formatValue(value)}
            {suffix && (
              <span className="text-[14px] font-light text-[color:var(--text-muted)]">
                {suffix}
              </span>
            )}
          </>
        )}
      </div>
      <div className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[color:var(--text-muted)]">
        {label}
      </div>
    </div>
  )
}
