import { format, parseISO } from 'date-fns'

/*
 * weekShortLabel — render a YYYY-MM-DD Monday as "Jun 2" for chart axis ticks
 * and photo-timeline thumbnails.
 *
 * Used by both the trend charts (X-axis tick) and the photo timeline
 * (thumbnail caption). One place keeps the labels consistent.
 *
 * `parseISO` accepts the backend's exact wire format and yields a Date in
 * the local TZ — same TZ rule we use everywhere else in the portal.
 */
export function weekShortLabel(yyyymmdd: string): string {
  return format(parseISO(yyyymmdd), 'MMM d')
}
