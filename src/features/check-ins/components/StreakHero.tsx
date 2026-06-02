import { Link } from '@tanstack/react-router'

import { BrandSurface } from '@/components/ui/BrandSurface'
import { Button } from '@/components/ui/button'
import type { UseStreakResult } from '@/features/check-ins/hooks/useStreak'

interface Props {
  streak: UseStreakResult
  /** Used in state 3's "Locked in" copy when present ("Marcus is reviewing"). */
  coachFirstName?: string | null | undefined
}

const FIRE = '🔥'

/* Map tier 0-5 to a string of fire emojis. Empty for tier 0. */
function fireString(tier: number): string {
  const safe = Math.max(0, Math.min(5, Math.floor(tier)))
  return FIRE.repeat(safe)
}

/*
 * Progress fill toward the next tier. Returns 0..1 for active streaks,
 * 1 (full) at max tier (no next), 0 for an empty/broken streak.
 *
 * The "previous threshold" depends on the next tier — we infer it from
 * the known threshold table so the bar fills from 0% at the start of a
 * tier to 100% at the next milestone.
 */
const PREV_THRESHOLD_FOR_NEXT_TIER: Record<number, number> = {
  2: 0, // 1-2 weeks → next at 3
  3: 3, // 3-6 weeks → next at 7
  4: 7, // 7-13 weeks → next at 14
  5: 14, // 14-29 weeks → next at 30
}

function progressFill(count: number, nextTier: number | null): number {
  if (count <= 0) return 0
  if (nextTier === null) return 1
  const prev = PREV_THRESHOLD_FOR_NEXT_TIER[nextTier] ?? 0
  // We're aiming at the threshold for `nextTier`. The threshold IS nextTier's
  // entry point: 3, 7, 14, 30 for tiers 2..5 respectively.
  const TIER_START = [0, 1, 3, 7, 14, 30] as const
  const target = TIER_START[nextTier] ?? count + 1
  const range = Math.max(1, target - prev)
  const filled = Math.max(0, count - prev)
  return Math.min(1, filled / range)
}

export function StreakHero({ streak, coachFirstName }: Props) {
  if (streak.isLoading) {
    return (
      <div className="rounded-[22px] bg-[var(--green-deep)] p-7 shadow-[0_12px_36px_rgba(26,122,74,.22)] animate-pulse">
        <div className="h-3 w-20 rounded bg-white/10" />
        <div className="mt-4 h-16 w-32 rounded bg-white/10" />
        <div className="mt-5 h-3 w-3/4 rounded bg-white/10" />
        <div className="mt-5 h-1.5 w-full rounded-full bg-white/10" />
      </div>
    )
  }

  const fires = fireString(streak.tier)
  const fill = progressFill(streak.count, streak.nextTier)

  // ---- State 4: broken ----
  if (streak.isBroken) {
    return (
      <BrandSurface tone="deep">
        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55">
          Your streak
        </div>
        <div className="mt-1.5 flex items-baseline gap-3">
          <div className="font-display text-[64px] font-light leading-none tracking-tight" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
            —
          </div>
          <div className="text-[17px] font-medium text-white/75">
            broken last week
          </div>
        </div>
        <p className="mt-3.5 max-w-md text-[13.5px] leading-snug text-white/75">
          You missed last week.{' '}
          {streak.brokenAt > 0 ? (
            <>
              Your best streak was {streak.brokenAt} weeks {fireString(Math.max(1, Math.min(5, Math.floor(streak.brokenAt / 3) + 1)))}.
            </>
          ) : null}
        </p>
        <Button
          asChild
          size="lg"
          className="mt-5 bg-[var(--fire-2)] text-[color:var(--green-deep)] hover:bg-[var(--fire-1)]"
        >
          <Link to="/check-in">Restart your streak →</Link>
        </Button>
      </BrandSurface>
    )
  }

  // ---- State 1: first-time / empty ----
  if (streak.count === 0) {
    return (
      <BrandSurface tone="deep">
        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55">
          Your streak
        </div>
        <div className="mt-1.5 flex items-baseline gap-3">
          <div className="font-display text-[64px] font-light leading-none tracking-tight" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
            —
          </div>
          <div className="text-[17px] font-medium text-white/75">weeks</div>
        </div>
        <p className="mt-3.5 max-w-md text-[13.5px] leading-snug text-white/75">
          Your first check-in is your streak. Submit by Sunday to start.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-5 bg-[var(--fire-2)] text-[color:var(--green-deep)] hover:bg-[var(--fire-1)]"
        >
          <Link to="/check-in">Start your check-in →</Link>
        </Button>
      </BrandSurface>
    )
  }

  // ---- States 2 & 3: active streak (hero-band sizing) ----
  return (
    <BrandSurface tone="deep" padding="xl">
      <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55">
        Your streak
      </div>

      <div className="mt-3 flex items-baseline gap-4">
        <div
          className="font-display text-[88px] lg:text-[104px] xl:text-[120px] font-light leading-none tracking-[-0.03em]"
          style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
        >
          {streak.count}
        </div>
        <div className="text-[18px] font-medium text-white/75">
          {streak.count === 1 ? 'week' : 'weeks'}
        </div>
        {fires && (
          <div
            className="ml-1 text-[34px] leading-none drop-shadow-[0_3px_14px_rgba(255,90,61,.5)]"
            aria-label={`${streak.tier} flame${streak.tier === 1 ? '' : 's'}`}
          >
            {fires}
          </div>
        )}
      </div>

      <p
        className="mt-4 max-w-md font-display text-[18px] lg:text-[20px] leading-snug text-white/85"
        style={{ fontVariationSettings: "'opsz' 22, 'SOFT' 60" }}
      >
        {streak.hasSubmittedThisWeek ? (
          <>
            Locked in for Week {streak.count}.{' '}
            <em
              className="not-italic text-white"
              style={{
                fontVariationSettings: "'opsz' 26, 'SOFT' 100",
                fontWeight: 400,
              }}
            >
              {coachFirstName
                ? `${coachFirstName} is reviewing.`
                : 'Your coach is reviewing.'}
            </em>
          </>
        ) : streak.weeksToNextTier === 1 ? (
          <>One more check-in and you unlock the next flame.</>
        ) : streak.weeksToNextTier !== null ? (
          <>
            Keep going — {streak.weeksToNextTier} more weeks to the next flame.
          </>
        ) : (
          <>You're at the top tier. Just keep doing the work.</>
        )}
      </p>

      {/* Progress bar — fills toward the next tier */}
      <div className="mt-7 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.round(fill * 100)}%`,
            background:
              'linear-gradient(135deg, var(--fire-1) 0%, var(--fire-2) 50%, var(--fire-3) 100%)',
          }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11.5px] tracking-[0.04em] text-white/55">
        <span>Tier {Math.max(1, streak.tier)}</span>
        <span>
          {streak.nextTier === null
            ? 'Max tier reached'
            : `${streak.weeksToNextTier ?? 0} ${
                (streak.weeksToNextTier ?? 0) === 1 ? 'week' : 'weeks'
              } to Tier ${streak.nextTier}`}
        </span>
      </div>
    </BrandSurface>
  )
}
