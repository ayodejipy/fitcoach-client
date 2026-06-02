import { format, parseISO } from 'date-fns'

import { pickStringFromNotificationData } from '@/features/notifications/utils/pick-notification-data'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'

/*
 * deriveSubject — produce a friendly "Re: Week N check-in" subject line
 * for a coach-reply notification card.
 *
 * Reads optional fields from the notification's opaque `data` blob:
 *   - `subject` (string): backend-provided subject, used verbatim
 *   - `check_in_week` (number-as-string or number): derives
 *     "Re: Week N check-in" (forward-compat; not currently emitted)
 *   - `week_start_date` (YYYY-MM-DD): derives "Re: Check-in · week of
 *     MMM d" using the Monday of the check-in week. THIS is what the
 *     backend's `checkin.responded` payload carries today (the data is
 *     a full CheckIn DTO; see backend `internal/models/checkin.go`).
 *
 * Returns null when none of the above fields are available — the card
 * omits the subject row rather than showing a generic placeholder.
 */
export function deriveSubject(notification: ModelsNotification): string | null {
  const data = notification.data ?? {}

  const explicitSubject = pickStringFromNotificationData(data, 'subject')
  if (explicitSubject) return explicitSubject

  const weekRaw = data['check_in_week']
  const weekNumber =
    typeof weekRaw === 'number'
      ? weekRaw
      : typeof weekRaw === 'string'
        ? Number(weekRaw)
        : null
  if (weekNumber !== null && Number.isFinite(weekNumber)) {
    return `Re: Week ${weekNumber} check-in`
  }

  const weekStart = pickStringFromNotificationData(data, 'week_start_date')
  if (weekStart) {
    try {
      const formatted = format(parseISO(weekStart), 'MMM d')
      return `Re: Check-in · week of ${formatted}`
    } catch {
      // Bad date string — fall through to null below.
    }
  }

  return null
}
