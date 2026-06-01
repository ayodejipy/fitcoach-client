import { differenceInHours, formatDistanceToNowStrict, parseISO } from 'date-fns'

/*
 * sessionCountdown — short "in N hours / days" label for sessions within the
 * next 48 hours. Returns null when the session is more than 48h away (the
 * regular date/time line already conveys the schedule cleanly past that
 * window, so the chip would be visual noise).
 *
 * Used by NextSessionCard to render a fire-2 orange urgency chip when the
 * session is close enough that the user should be thinking about it.
 */
interface CountdownLabel {
  label: string
  /** True when the session is within 24h — emphasizes "today/tomorrow soon." */
  urgent: boolean
}

const NEAR_WINDOW_HOURS = 48
const URGENT_WINDOW_HOURS = 24

export function sessionCountdown(
  rfc3339: string,
  now: Date = new Date(),
): CountdownLabel | null {
  const startsAt = parseISO(rfc3339)
  if (Number.isNaN(startsAt.getTime())) return null

  const hoursAway = differenceInHours(startsAt, now)
  if (hoursAway < 0) return null // past, no countdown
  if (hoursAway > NEAR_WINDOW_HOURS) return null // too far out

  return {
    label: formatDistanceToNowStrict(startsAt, { addSuffix: true }),
    urgent: hoursAway <= URGENT_WINDOW_HOURS,
  }
}
