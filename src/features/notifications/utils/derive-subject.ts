import { pickStringFromNotificationData } from '@/features/notifications/utils/pick-notification-data'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'

/*
 * deriveSubject — produce a friendly "Re: Week N check-in" subject line for
 * a coach-reply notification's message card.
 *
 * Reads optional fields from the notification's opaque `data` blob:
 *   - `subject` (string): backend-provided subject, used verbatim if present
 *   - `check_in_week` (number-as-string or number): derives "Re: Week N check-in"
 *
 * Returns null when neither field is available — the card omits the subject
 * row entirely rather than showing a generic placeholder.
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

  return null
}
