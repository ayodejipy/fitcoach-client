/*
 * weekEncouragement — short coaching line shown above the Submit button on
 * the check-in form. Tuned per program week so it doesn't read as a generic
 * pep talk; the user feels seen.
 *
 * Static map for the explicit weeks we care about (1-12 cover the standard
 * coaching program). Fallback function handles weeks past the program +
 * unknown weeks gracefully.
 */

const WEEK_COPY: Record<number, string> = {
  1: 'Week 1: just show up.',
  2: 'Two weeks in. The habit is forming.',
  3: "You unlock your first flame this week.",
  4: 'A month is the foundation.',
  5: "You're building real momentum now.",
  6: "Halfway to Tier 2 territory.",
  7: 'Tier 2 unlocked. The hard part is behind you.',
  8: 'Showing up beats showing off.',
  9: "You're closer to the end than the start.",
  10: 'Two weeks left. Finish strong.',
  11: 'Final stretch — keep your routine intact.',
  12: 'You finished what you started.',
}

function defaultCopy(week: number): string {
  if (week <= 0) return "Let's get this week logged."
  if (week < 14) return 'Keep showing up. The streak is the story.'
  if (week < 30) return "You're building serious depth now."
  return "You're the proof that consistency works."
}

export function weekEncouragement(
  week: number | null | undefined,
): string {
  if (!week) return defaultCopy(0)
  return WEEK_COPY[week] ?? defaultCopy(week)
}
