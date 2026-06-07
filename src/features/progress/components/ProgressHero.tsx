import { BrandSurface } from '@/components/ui/BrandSurface'
import type { UseStreakResult } from '@/features/check-ins/hooks/useStreak'
import type { WeightDelta } from '@/features/progress/hooks/useWeightDelta'
import { useMe } from '@/features/profile/hooks/useMe'

/*
 * ProgressHero — 3-stat band at the top of /progress.
 *
 *   1. Weight delta — "−6.2 lbs" with "since Week 1 · now 180.0 lbs" subline.
 *      Brand-mint surface. Hidden entirely if we don't have enough data yet
 *      (< 2 check-ins with weight).
 *   2. Streak — count + flames + "Tier N · X weeks to Tier N+1" subline.
 *      Brand-mint surface.
 *   3. Weeks logged — "5 of 12" with a thin brand-green progress bar below.
 *      White card.
 *
 * Layout: 3 columns on lg+, 2 columns on mobile with the "Weeks logged"
 * block spanning both. Mobile collapses gracefully without losing info.
 */
interface Props {
  weight: WeightDelta | null
  streak: UseStreakResult
  weeksLogged: number
  programTotal: number | null | undefined
}

const FIRE = '🔥'

export function ProgressHero({
  weight,
  streak,
  weeksLogged,
  programTotal,
}: Props) {
  const { data: me } = useMe()
  const weightUnit = me?.weight_unit === 'kg' ? 'kg' : 'lbs'

  return (
    <section className="grid gap-4 grid-cols-2 lg:grid-cols-3">
      {/* ---- Weight delta ---- */}
      {weight ? (
        <BrandSurface tone="mint" padding="md">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--green-brand)]">
            Weight
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className="font-display text-[44px] lg:text-[56px] font-light leading-none tracking-[-0.02em] text-foreground tabular-nums"
              style={{ fontVariationSettings: "'opsz' 120, 'SOFT' 30" }}
            >
              {weight.deltaLbs > 0 ? '+' : ''}
              {weight.deltaLbs.toFixed(1)}
            </span>
            <span className="text-[15px] font-medium text-[color:var(--text-secondary)]">
              {weightUnit}
            </span>
          </div>
          <p className="mt-1 text-[12.5px] text-[color:var(--text-secondary)]">
            since Week 1 · now {weight.latestLbs.toFixed(1)} {weightUnit}
          </p>
        </BrandSurface>
      ) : (
        <BrandSurface tone="mint" padding="md">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--green-brand)]">
            Weight
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className="font-display text-[44px] lg:text-[56px] font-light leading-none tracking-tight text-[color:var(--text-muted)]"
              style={{ fontVariationSettings: "'opsz' 120, 'SOFT' 30" }}
            >
              —
            </span>
          </div>
          <p className="mt-1 text-[12.5px] text-[color:var(--text-secondary)]">
            Log two weeks to see your trend.
          </p>
        </BrandSurface>
      )}

      {/* ---- Streak ---- */}
      <BrandSurface tone="mint" padding="md">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--green-brand)]">
          Streak
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className="font-display text-[44px] lg:text-[56px] font-light leading-none tracking-[-0.02em] text-foreground tabular-nums"
            style={{ fontVariationSettings: "'opsz' 120, 'SOFT' 30" }}
          >
            {streak.isBroken ? '—' : streak.count}
          </span>
          {!streak.isBroken && (
            <>
              <span className="text-[15px] font-medium text-[color:var(--text-secondary)]">
                {streak.count === 1 ? 'week' : 'weeks'}
              </span>
              {streak.tier > 0 && (
                <span
                  className="ml-1 text-[22px] leading-none"
                  aria-label={`${streak.tier} flame${streak.tier === 1 ? '' : 's'}`}
                >
                  {FIRE.repeat(streak.tier)}
                </span>
              )}
            </>
          )}
        </div>
        <p className="mt-1 text-[12.5px] text-[color:var(--text-secondary)]">
          {streak.isBroken
            ? `Broken last week. Best was ${streak.brokenAt} weeks.`
            : streak.nextTier === null
              ? 'Top tier reached.'
              : `Tier ${Math.max(1, streak.tier)} · ${streak.weeksToNextTier ?? 0} ${(streak.weeksToNextTier ?? 0) === 1 ? 'week' : 'weeks'} to Tier ${streak.nextTier}`}
        </p>
      </BrandSurface>

      {/* ---- Weeks logged ---- */}
      <div className="col-span-2 lg:col-span-1 rounded-[22px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
          Weeks logged
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className="font-display text-[44px] lg:text-[56px] font-light leading-none tracking-[-0.02em] text-foreground tabular-nums"
            style={{ fontVariationSettings: "'opsz' 120, 'SOFT' 30" }}
          >
            {weeksLogged}
          </span>
          {programTotal && (
            <span className="text-[15px] font-medium text-[color:var(--text-secondary)]">
              of {programTotal}
            </span>
          )}
        </div>
        {programTotal && programTotal > 0 && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--border-muted)]">
            <div
              className="h-full rounded-full bg-[color:var(--green-brand)]"
              style={{
                width: `${Math.min(100, Math.round((weeksLogged / programTotal) * 100))}%`,
              }}
            />
          </div>
        )}
      </div>
    </section>
  )
}
