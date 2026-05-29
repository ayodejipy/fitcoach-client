/*
 * Streak derivation — the headline math behind the dashboard's dopamine hit.
 *
 * Pinned by /plan-eng-review Decision 3A + cross-model T1:
 *   - source of truth: `week_start_date` on each portal check-in (Monday,
 *     YYYY-MM-DD, normalized by a backend trigger).
 *   - "current expected Monday" = ISO Monday of `today` in the device's
 *     LOCAL timezone (the simplest correct rule; a traveling user can
 *     only cross the boundary by one Monday at a time, which is at most
 *     a one-week display wobble).
 *   - lazy pagination: if the streak count reaches the end of the input
 *     list, the caller should fetch the next page and re-derive (see
 *     `reachedListEnd` in the result).
 *
 * Tier escalation (number of fire emojis):
 *   0 weeks  → 0 flames (empty state)
 *   1-2      → 1 flame
 *   3-6      → 2 flames
 *   7-13     → 3 flames
 *   14-29    → 4 flames
 *   30+      → 5 flames
 *
 * Broken-streak handling (Decision 5A — recovery framing, never punish):
 *   If the latest check-in is older than LAST week's Monday, we treat the
 *   active streak as broken. The result captures both the broken state and
 *   the prior streak count so the UI can say "Your best streak was N weeks"
 *   instead of "Streak: 0."
 *
 * The function is PURE — accepts a Date so tests can fix "now" — and lives
 * in utils/ so it's the easiest possible unit test target.
 */

/** A single check-in row, narrowed to just the fields streak math reads. */
export interface CheckInForStreak {
  /** YYYY-MM-DD, Monday of the week being logged. */
  week_start_date?: string
}

export interface StreakResult {
  /** Count of consecutive weeks submitted, ending at the most recent expected Monday. */
  count: number
  /** Number of fire emojis to render (see tier table in the file header). */
  tier: number
  /** True when the user has already submitted for this week's Monday. */
  hasSubmittedThisWeek: boolean
  /** True when the streak is broken — most recent check-in older than last Monday. */
  isBroken: boolean
  /**
   * If `isBroken`, the count the user HAD before missing. Used in copy:
   * "Your best streak was N weeks." Zero if no prior check-ins at all.
   */
  brokenAt: number
  /**
   * YYYY-MM-DD of THIS week's Monday in the client's local TZ.
   * The check-in form uses this as the `week_start_date` body field.
   */
  thisMonday: string
  /**
   * True if the derive walked through all the supplied check-ins and the
   * streak was still climbing — caller should fetch the next page and
   * re-derive for an accurate count.
   */
  reachedListEnd: boolean
  /** How many weeks until the NEXT tier milestone, or null at max tier. */
  weeksToNextTier: number | null
  /** The tier number the next milestone unlocks. */
  nextTier: number | null
}

/**
 * Format a Date as YYYY-MM-DD in the device's LOCAL timezone.
 * `toISOString()` would convert to UTC and produce wrong dates near midnight.
 */
function fmtLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Monday of the ISO week containing `d`, in LOCAL timezone.
 * Backend's `normalize_week_start` trigger does the same shift on the SQL
 * side, so YYYY-MM-DD values from both sides line up exactly.
 */
function startOfISOWeek(d: Date): Date {
  const day = d.getDay() // 0=Sun..6=Sat
  // Shift to Monday: Sunday (0) → -6, Mon (1) → 0, Tue (2) → -1, ..., Sat (6) → -5
  const diff = day === 0 ? -6 : 1 - day
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff)
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

export function tierOf(weeks: number): number {
  if (weeks <= 0) return 0
  if (weeks < 3) return 1
  if (weeks < 7) return 2
  if (weeks < 14) return 3
  if (weeks < 30) return 4
  return 5
}

const TIER_THRESHOLDS = [3, 7, 14, 30] as const

function nextMilestone(weeks: number): {
  weeksToNext: number
  nextTier: number
} | null {
  for (let i = 0; i < TIER_THRESHOLDS.length; i++) {
    const t = TIER_THRESHOLDS[i]!
    if (weeks < t) {
      return { weeksToNext: t - weeks, nextTier: i + 2 }
    }
  }
  return null
}

/**
 * Derive the streak from a list of portal check-ins.
 *
 * Input doesn't need to be pre-sorted; this function sorts defensively by
 * `week_start_date` DESC.
 *
 * `now` parameter exists for test seams. Production callers pass `new Date()`.
 */
export function deriveStreak(
  checkIns: ReadonlyArray<CheckInForStreak> | undefined,
  now: Date = new Date(),
): StreakResult {
  const todayMonday = startOfISOWeek(now)
  const thisMondayISO = fmtLocalDate(todayMonday)
  const lastMondayISO = fmtLocalDate(addDays(todayMonday, -7))

  // Defensive sort: backend list endpoint is documented DESC, but we don't
  // want this util to silently break if a caller hands it an unsorted slice.
  const sorted = (checkIns ?? [])
    .filter((c): c is CheckInForStreak & { week_start_date: string } =>
      typeof c.week_start_date === 'string',
    )
    .slice()
    .sort((a, b) => (a.week_start_date < b.week_start_date ? 1 : -1))

  if (sorted.length === 0) {
    return {
      count: 0,
      tier: 0,
      hasSubmittedThisWeek: false,
      isBroken: false,
      brokenAt: 0,
      thisMonday: thisMondayISO,
      reachedListEnd: false,
      weeksToNextTier: null,
      nextTier: null,
    }
  }

  const latestWeek = sorted[0]!.week_start_date

  // Broken: the latest submission is OLDER than last Monday. That means we
  // skipped at least one week; the active streak is dead.
  if (latestWeek < lastMondayISO) {
    // Count the streak that existed AT that earlier point — walk forward
    // from the latest entry counting consecutive weeks before the gap.
    let brokenAt = 0
    let cursor = latestWeek // YYYY-MM-DD
    for (const row of sorted) {
      if (row.week_start_date === cursor) {
        brokenAt += 1
        // Move cursor back one week. Parse via Date to handle month/year crossings.
        const [y, m, d] = cursor.split('-').map(Number) as [number, number, number]
        cursor = fmtLocalDate(addDays(new Date(y, m - 1, d), -7))
      } else if (row.week_start_date < cursor) {
        break
      }
    }
    return {
      count: 0,
      tier: 0,
      hasSubmittedThisWeek: false,
      isBroken: true,
      brokenAt,
      thisMonday: thisMondayISO,
      reachedListEnd: false,
      weeksToNextTier: null,
      nextTier: null,
    }
  }

  // Active streak path: walk newest-first counting consecutive weeks back
  // from THIS Monday (if submitted) or LAST Monday (if not yet submitted).
  const hasSubmittedThisWeek = latestWeek === thisMondayISO

  // Cursor starts at the most recent Monday we EXPECT to count.
  let expectedISO = hasSubmittedThisWeek ? thisMondayISO : lastMondayISO
  let count = 0
  let lastConsumedIndex = -1

  for (let i = 0; i < sorted.length; i++) {
    const row = sorted[i]!
    if (row.week_start_date === expectedISO) {
      count += 1
      lastConsumedIndex = i
      // Step back one week
      const [y, m, d] = expectedISO.split('-').map(Number) as [number, number, number]
      expectedISO = fmtLocalDate(addDays(new Date(y, m - 1, d), -7))
    } else if (row.week_start_date < expectedISO) {
      // Gap encountered — streak ends here.
      break
    }
    // row.week_start_date > expectedISO is impossible after sort + the
    // not-broken branch; skip defensively if it ever shows up.
  }

  // If we consumed every row AND we never hit a gap, the caller's page
  // might have been truncated. Signal so they can paginate and re-derive.
  const reachedListEnd =
    count > 0 &&
    lastConsumedIndex === sorted.length - 1 &&
    count === sorted.length

  const next = nextMilestone(count)

  return {
    count,
    tier: tierOf(count),
    hasSubmittedThisWeek,
    isBroken: false,
    brokenAt: 0,
    thisMonday: thisMondayISO,
    reachedListEnd,
    weeksToNextTier: next?.weeksToNext ?? null,
    nextTier: next?.nextTier ?? null,
  }
}
