/*
 * initials — derive a 1-2 character initial from a person's name.
 *
 * "Marcus Holloway" → "MH"
 * "Marcus" → "M"
 * "" / null / undefined → "?"
 *
 * Used by GreetingHeader (coach mini chip), RecentCoachReply (avatar
 * circle), and any future surface that needs a name-fallback avatar. Lives
 * in features/profile because it operates on profile data (coach name,
 * user name) that the profile feature owns.
 */
export function initials(name: string | null | undefined): string {
  if (!name) return '?'
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (
    parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
  ).toUpperCase()
}
