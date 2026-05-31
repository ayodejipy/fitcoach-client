import { describe, expect, it } from 'vitest'

import {
  deriveStreak,
  tierOf,
  type CheckInForStreak,
} from '@/features/check-ins/utils/streak-derive'

/*
 * Tests for the streak derivation utility — the most business-critical
 * pure function in the portal. Covers the four streak states, tier
 * escalation, milestone math, pagination signal, and the defensive sort.
 *
 * "now" is fixed per suite so the math is deterministic. Helpers below
 * compute Mondays relative to that fixed `now` so test data stays readable.
 */

/* --- test helpers ---------------------------------------------------- */

/** Wednesday, January 7 2026 at noon local. Used as a stable "now". */
const NOW = new Date(2026, 0, 7, 12, 0, 0) // 2026-01-07, day=3 (Wed)
const THIS_MONDAY = '2026-01-05'

/** Format a Date as YYYY-MM-DD in LOCAL time (mirrors streak-derive's helper). */
function iso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Return the Monday `weeks` weeks before THIS_MONDAY as YYYY-MM-DD. */
function mondayWeeksAgo(weeks: number): string {
  // THIS_MONDAY parsed back into a Date, then subtracted.
  const [y, m, d] = THIS_MONDAY.split('-').map(Number) as [number, number, number]
  const base = new Date(y, m - 1, d)
  base.setDate(base.getDate() - 7 * weeks)
  return iso(base)
}

/** Build a check-in row for the streak math (only week_start_date matters). */
function ci(weekStart: string): CheckInForStreak {
  return { week_start_date: weekStart }
}

/**
 * Build N contiguous check-ins ending at the supplied Monday (descending —
 * the order the backend returns them).
 */
function contiguous(latestMonday: string, count: number): CheckInForStreak[] {
  const out: CheckInForStreak[] = []
  const [y, m, d] = latestMonday.split('-').map(Number) as [number, number, number]
  for (let i = 0; i < count; i++) {
    const dt = new Date(y, m - 1, d - 7 * i)
    out.push(ci(iso(dt)))
  }
  return out
}

/* --- empty + first-time ---------------------------------------------- */

describe('deriveStreak — empty inputs', () => {
  it('returns zero state for an empty array', () => {
    const r = deriveStreak([], NOW)
    expect(r.count).toBe(0)
    expect(r.tier).toBe(0)
    expect(r.hasSubmittedThisWeek).toBe(false)
    expect(r.isBroken).toBe(false)
    expect(r.brokenAt).toBe(0)
    expect(r.thisMonday).toBe(THIS_MONDAY)
    expect(r.reachedListEnd).toBe(false)
    expect(r.weeksToNextTier).toBeNull()
    expect(r.nextTier).toBeNull()
  })

  it('returns zero state for undefined input', () => {
    const r = deriveStreak(undefined, NOW)
    expect(r.count).toBe(0)
    expect(r.isBroken).toBe(false)
  })

  it('treats rows without a week_start_date as if not present', () => {
    const r = deriveStreak([{}, {} as CheckInForStreak], NOW)
    expect(r.count).toBe(0)
    expect(r.isBroken).toBe(false)
  })
})

/* --- active streak, not submitted this week -------------------------- */

describe('deriveStreak — active, not yet submitted this week', () => {
  it('counts the streak from last Monday backwards', () => {
    const r = deriveStreak(contiguous(mondayWeeksAgo(1), 4), NOW)
    expect(r.count).toBe(4)
    expect(r.hasSubmittedThisWeek).toBe(false)
    expect(r.isBroken).toBe(false)
    expect(r.thisMonday).toBe(THIS_MONDAY)
  })

  it('returns count=1 for a single last-week submission', () => {
    const r = deriveStreak([ci(mondayWeeksAgo(1))], NOW)
    expect(r.count).toBe(1)
    expect(r.hasSubmittedThisWeek).toBe(false)
    expect(r.isBroken).toBe(false)
  })

  it('stops counting at the first gap', () => {
    const rows = [
      ci(mondayWeeksAgo(1)),
      ci(mondayWeeksAgo(2)),
      // missing week 3
      ci(mondayWeeksAgo(4)),
    ]
    const r = deriveStreak(rows, NOW)
    expect(r.count).toBe(2)
    expect(r.isBroken).toBe(false)
  })
})

/* --- active streak, submitted this week ------------------------------ */

describe('deriveStreak — active, already submitted this week', () => {
  it('counts this week plus the contiguous run before it', () => {
    const r = deriveStreak(contiguous(THIS_MONDAY, 5), NOW)
    expect(r.count).toBe(5)
    expect(r.hasSubmittedThisWeek).toBe(true)
    expect(r.isBroken).toBe(false)
  })

  it('returns count=1 when only this week has been submitted', () => {
    const r = deriveStreak([ci(THIS_MONDAY)], NOW)
    expect(r.count).toBe(1)
    expect(r.hasSubmittedThisWeek).toBe(true)
  })
})

/* --- broken streak (recovery framing) -------------------------------- */

describe('deriveStreak — broken streak', () => {
  it('flags broken when the latest submission is older than last Monday', () => {
    // Last submission was 2 weeks ago — we missed last week.
    const r = deriveStreak([ci(mondayWeeksAgo(2))], NOW)
    expect(r.isBroken).toBe(true)
    expect(r.count).toBe(0)
    expect(r.brokenAt).toBe(1)
  })

  it('records the prior streak length in brokenAt', () => {
    // Three contiguous weeks ending 5 weeks ago, then a gap until now.
    const rows = contiguous(mondayWeeksAgo(5), 3)
    const r = deriveStreak(rows, NOW)
    expect(r.isBroken).toBe(true)
    expect(r.brokenAt).toBe(3)
    expect(r.count).toBe(0)
  })

  it('treats a deep gap with messy history correctly', () => {
    // 2-week run, then a gap, then another 1-week (latest is still old).
    const rows = [
      ci(mondayWeeksAgo(4)),
      ci(mondayWeeksAgo(5)),
      // gap at week 6
      ci(mondayWeeksAgo(7)),
    ]
    const r = deriveStreak(rows, NOW)
    expect(r.isBroken).toBe(true)
    // brokenAt counts the contiguous run ending at the latest entry (4).
    expect(r.brokenAt).toBe(2)
  })
})

/* --- tier escalation ------------------------------------------------- */

describe('tierOf — fire-emoji thresholds', () => {
  it('returns 0 for zero or negative weeks', () => {
    expect(tierOf(0)).toBe(0)
    expect(tierOf(-1)).toBe(0)
  })

  it('returns 1 for weeks 1-2', () => {
    expect(tierOf(1)).toBe(1)
    expect(tierOf(2)).toBe(1)
  })

  it('returns 2 for weeks 3-6', () => {
    expect(tierOf(3)).toBe(2)
    expect(tierOf(6)).toBe(2)
  })

  it('returns 3 for weeks 7-13', () => {
    expect(tierOf(7)).toBe(3)
    expect(tierOf(13)).toBe(3)
  })

  it('returns 4 for weeks 14-29', () => {
    expect(tierOf(14)).toBe(4)
    expect(tierOf(29)).toBe(4)
  })

  it('returns 5 at 30 weeks and beyond', () => {
    expect(tierOf(30)).toBe(5)
    expect(tierOf(99)).toBe(5)
  })
})

/* --- next-milestone math -------------------------------------------- */

describe('deriveStreak — next milestone', () => {
  it('points to tier 2 at 3 weeks when count=1', () => {
    const r = deriveStreak([ci(mondayWeeksAgo(1))], NOW)
    expect(r.weeksToNextTier).toBe(2)
    expect(r.nextTier).toBe(2)
  })

  it('points to tier 3 when count=4', () => {
    const r = deriveStreak(contiguous(mondayWeeksAgo(1), 4), NOW)
    expect(r.weeksToNextTier).toBe(3) // 7 - 4
    expect(r.nextTier).toBe(3)
  })

  it('returns null at max tier (30+ weeks)', () => {
    const r = deriveStreak(contiguous(THIS_MONDAY, 30), NOW)
    expect(r.weeksToNextTier).toBeNull()
    expect(r.nextTier).toBeNull()
  })
})

/* --- pagination signal ---------------------------------------------- */

describe('deriveStreak — reachedListEnd', () => {
  it('flips true when the streak consumed every supplied row', () => {
    // 5 contiguous rows, streak counts all 5 — no gap encountered, caller
    // should fetch the next page for an accurate total.
    const r = deriveStreak(contiguous(mondayWeeksAgo(1), 5), NOW)
    expect(r.reachedListEnd).toBe(true)
  })

  it('stays false when a gap is found in the list', () => {
    const rows = [
      ci(mondayWeeksAgo(1)),
      ci(mondayWeeksAgo(2)),
      ci(mondayWeeksAgo(5)), // gap before this
    ]
    const r = deriveStreak(rows, NOW)
    expect(r.reachedListEnd).toBe(false)
  })

  it('stays false on empty input', () => {
    expect(deriveStreak([], NOW).reachedListEnd).toBe(false)
  })
})

/* --- defensive sort + odd inputs ------------------------------------- */

describe('deriveStreak — defensive handling', () => {
  it('sorts unsorted input before walking the streak', () => {
    const rows = [
      ci(mondayWeeksAgo(3)),
      ci(mondayWeeksAgo(1)),
      ci(mondayWeeksAgo(2)),
    ]
    const r = deriveStreak(rows, NOW)
    expect(r.count).toBe(3)
    expect(r.isBroken).toBe(false)
  })

  it('ignores rows with weeks in the future', () => {
    const rows = [
      ci(mondayWeeksAgo(-2)), // future, ignored as "newer than expected"
      ci(mondayWeeksAgo(1)),
      ci(mondayWeeksAgo(2)),
    ]
    const r = deriveStreak(rows, NOW)
    expect(r.count).toBe(2)
  })

  it('thisMonday matches when now is a Monday itself', () => {
    const monday = new Date(2026, 0, 5, 12, 0, 0) // 2026-01-05, Mon
    const r = deriveStreak([], monday)
    expect(r.thisMonday).toBe('2026-01-05')
  })

  it('thisMonday matches when now is a Sunday (end of ISO week)', () => {
    const sunday = new Date(2026, 0, 11, 12, 0, 0) // 2026-01-11, Sun
    const r = deriveStreak([], sunday)
    expect(r.thisMonday).toBe('2026-01-05')
  })

  it('crosses month boundaries when computing prior Mondays', () => {
    // Now: Mon Feb 2, 2026 (day=1)
    // Streak rows: this week, last week (Mon Jan 26), and the week before
    // (Mon Jan 19) — crosses the Jan/Feb boundary.
    const feb2 = new Date(2026, 1, 2, 12, 0, 0)
    const rows = [ci('2026-02-02'), ci('2026-01-26'), ci('2026-01-19')]
    const r = deriveStreak(rows, feb2)
    expect(r.thisMonday).toBe('2026-02-02')
    expect(r.count).toBe(3)
    expect(r.hasSubmittedThisWeek).toBe(true)
  })
})
