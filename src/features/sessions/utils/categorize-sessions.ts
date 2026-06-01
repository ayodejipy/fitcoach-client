import { parseISO } from 'date-fns'

import type { ModelsSession } from '@/lib/api/generated/types.gen'

/*
 * categorizeSessions — split a session list into "upcoming" (starts_at in
 * the future) and "past" (starts_at in the past or missing).
 *
 * Returns each bucket sorted appropriately:
 *   - upcoming: soonest-first (the next one is at the top of the list)
 *   - past: most-recent-first
 *
 * Sessions with no `starts_at` are dropped — a session without a time has
 * no meaningful slot on the timeline.
 *
 * Pure derivation, no side effects. Tests live next to this util.
 */
export interface CategorizedSessions {
  upcoming: ModelsSession[]
  past: ModelsSession[]
}

interface SessionWithStartMs {
  session: ModelsSession
  startsAtMs: number
}

export function categorizeSessions(
  sessions: ModelsSession[] | undefined,
  now: Date = new Date(),
): CategorizedSessions {
  if (!sessions || sessions.length === 0) {
    return { upcoming: [], past: [] }
  }

  const nowMs = now.getTime()
  const upcoming: SessionWithStartMs[] = []
  const past: SessionWithStartMs[] = []

  for (const session of sessions) {
    if (!session.starts_at) continue
    const startsAtMs = parseISO(session.starts_at).getTime()
    if (Number.isNaN(startsAtMs)) continue
    if (startsAtMs >= nowMs) {
      upcoming.push({ session, startsAtMs })
    } else {
      past.push({ session, startsAtMs })
    }
  }

  upcoming.sort((earlier, later) => earlier.startsAtMs - later.startsAtMs)
  past.sort((earlier, later) => later.startsAtMs - earlier.startsAtMs)

  return {
    upcoming: upcoming.map((entry) => entry.session),
    past: past.map((entry) => entry.session),
  }
}
