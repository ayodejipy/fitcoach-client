import { format, formatDistanceToNowStrict, isThisYear, isToday, isTomorrow, parseISO } from 'date-fns'

/*
 * Session date/time formatting — date-fns wrappers for the friendly labels
 * the dashboard card + list rows show.
 *
 * Two formatters because the contexts are different:
 *   - sessionDateLabel: "Today", "Tomorrow", "Thu, Jun 5", or "Jun 5, 2027"
 *     for older items. Switches based on proximity so the dashboard card
 *     can show a concise human label.
 *   - sessionTimeRange: "2:30 PM · 45 min" — what time it starts + how long.
 */

export function sessionDateLabel(rfc3339: string): string {
  const d = parseISO(rfc3339)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  if (isThisYear(d)) return format(d, 'EEE, MMM d')
  return format(d, 'MMM d, yyyy')
}

export function sessionTimeRange(
  rfc3339: string,
  durationMins?: number,
): string {
  const t = format(parseISO(rfc3339), 'h:mm a')
  if (!durationMins || durationMins <= 0) return t
  return `${t} · ${durationMins} min`
}

/**
 * For past sessions: "3 days ago", "yesterday", "2 weeks ago".
 * `addSuffix: true` adds the "ago" / "in" word; we only show this for past
 * sessions so the suffix is always "ago".
 */
export function sessionRelativeLabel(rfc3339: string): string {
  return `${formatDistanceToNowStrict(parseISO(rfc3339))} ago`
}
