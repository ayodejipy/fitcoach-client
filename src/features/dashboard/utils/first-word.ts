/*
 * firstWord — "Marcus Holloway" → "Marcus".
 *
 * Used in dashboard copy where addressing the coach by first name reads
 * friendlier than the full name (e.g. "Marcus is reviewing"). Returns null
 * when the input is missing or whitespace-only so callers can render an
 * unconditional skeleton without a flash of bad copy.
 */
export function firstWord(name: string | null | undefined): string | null {
  if (!name) return null
  const trimmedName = name.trim()
  if (!trimmedName) return null
  return trimmedName.split(/\s+/)[0] ?? null
}
