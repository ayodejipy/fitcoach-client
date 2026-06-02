import { pickStringFromNotificationData } from '@/features/notifications/utils/pick-notification-data'
import type { ModelsNotification } from '@/lib/api/generated/types.gen'

/*
 * deriveCoachReplyPreview — pull the displayable reply text from a
 * `checkin.responded` notification.
 *
 * Backend wire shape: `notification.data` for `checkin.responded` is a
 * full CheckIn DTO (see backend `internal/models/checkin.go`). The coach's
 * reply text lives in `coach_response` (string, optional). We surface
 * that verbatim — the MessageThread card line-clamps it for display.
 *
 * Fallback order:
 *   1. `data.coach_response` — the actual reply text (primary path)
 *   2. `data.preview` — a backend-provided short preview (forward-compat,
 *      not currently emitted for checkin.responded)
 *   3. Static fallback when the coach hasn't included response text
 *
 * The fallback string is shown as-is inside the italic Fraunces quote
 * treatment, so it reads as a placeholder for the missing reply rather
 * than a generic error.
 */
export function deriveCoachReplyPreview(
  notification: ModelsNotification,
): string {
  const data = notification.data ?? {}
  const coachResponse = pickStringFromNotificationData(data, 'coach_response')
  if (coachResponse && coachResponse.trim()) return coachResponse.trim()

  const preview = pickStringFromNotificationData(data, 'preview')
  if (preview && preview.trim()) return preview.trim()

  return 'Open the reply for the full message.'
}
