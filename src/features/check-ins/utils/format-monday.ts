import { format, parseISO } from 'date-fns'

/*
 * formatMondayFriendly — "2026-05-25" → "Mon, May 25" in the device's local
 * timezone.
 *
 * Used by CheckInForm to render the week-of date below the page headline.
 * Extracted from inline-at-the-bottom helper (debt cleanup) into utils so
 * any future surface needing the same format reuses it.
 */
export function formatMondayFriendly(yyyymmdd: string): string {
  return format(parseISO(yyyymmdd), 'EEE, MMM d')
}
