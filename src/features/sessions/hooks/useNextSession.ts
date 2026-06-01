import { useMemo } from 'react'

import { useSessions } from '@/features/sessions/hooks/useSessions'
import { categorizeSessions } from '@/features/sessions/utils/categorize-sessions'
import type { ModelsSession } from '@/lib/api/generated/types.gen'

/*
 * useNextSession — derives "the soonest upcoming session" for the dashboard.
 *
 * Reads from `useSessions()` (so the same fetch backs the dashboard card AND
 * the /sessions list view). Returns the first item from the upcoming bucket,
 * which `categorizeSessions` sorts soonest-first.
 *
 * The shape mirrors `useStreak` — flat StreakResult-style return + isLoading
 * + error so dashboard components can branch without unwrapping the query.
 */
export interface UseNextSessionResult {
  session: ModelsSession | null
  isLoading: boolean
  isError: boolean
}

export function useNextSession(): UseNextSessionResult {
  const query = useSessions()

  return useMemo(() => {
    if (query.isLoading) {
      return { session: null, isLoading: true, isError: false }
    }
    if (query.isError) {
      return { session: null, isLoading: false, isError: true }
    }
    const { upcoming } = categorizeSessions(query.data?.sessions)
    return {
      session: upcoming[0] ?? null,
      isLoading: false,
      isError: false,
    }
  }, [query.data, query.isLoading, query.isError])
}
