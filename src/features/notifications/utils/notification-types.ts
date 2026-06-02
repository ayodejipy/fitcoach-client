/*
 * notification-types — single source of truth for the notification
 * `type` strings the backend emits.
 *
 * Backend constants live in `internal/models/notification.go` (Go). When
 * the backend adds a new client-facing event, mirror it here in the same
 * dotted-namespace form. Multiple hooks + components read these constants
 * to decide what counts as a "coach reply" vs a system notification.
 *
 * Current backend events (as of writing):
 *   - "checkin.submitted" — coach-facing (client submitted a check-in).
 *     We don't render this in the client portal.
 *   - "checkin.responded" — client-facing (coach published their reply).
 *     This IS the coach reply on /messages.
 *
 * Future backend events (commented in the Go model file's namespace
 * docs): chat.message.created, session.reminder, etc. — add here when
 * the backend ships them.
 */

/** Notification types that count as a coach reply for the /messages
 *  inbox + the dropdown's rich-card branch. */
export const COACH_REPLY_TYPES: ReadonlySet<string> = new Set([
  'checkin.responded',
])

export function isCoachReply(type: string | undefined): boolean {
  return typeof type === 'string' && COACH_REPLY_TYPES.has(type)
}
