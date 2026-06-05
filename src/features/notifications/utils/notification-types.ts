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

/**
 * The single event-type string passed to the backend `?type=` filter on
 * `/api/v1/portal/notifications` for the /messages inbox. The backend
 * accepts one type at a time today; if we add a second coach-reply type,
 * this becomes an array and `useCoachReplies` will need to fan out.
 */
export const COACH_REPLY_PRIMARY_TYPE = 'checkin.responded' as const

export function isCoachReply(type: string | undefined): boolean {
  return typeof type === 'string' && COACH_REPLY_TYPES.has(type)
}
