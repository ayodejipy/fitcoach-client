/*
 * pickStringFromNotificationData — read a string field from a notification's
 * opaque `data` blob.
 *
 * The backend types `ModelsNotification.data` as `Record<string, unknown>`
 * (intentionally polymorphic per notification `type`). When we know a field
 * should be a string (coach_name, preview, etc.) but want to defend against
 * a malformed payload, this returns the value when it's a string and
 * undefined otherwise.
 *
 * Used by `useNotificationsRealtime` (toast copy) and `RecentCoachReply`
 * (preview card body). Lives in notifications/utils because the shape it
 * defends against is specific to notification payloads.
 */
export function pickStringFromNotificationData(
  data: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  if (!data) return undefined
  const value = data[key]
  return typeof value === 'string' ? value : undefined
}
