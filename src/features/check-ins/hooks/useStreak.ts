import { useMemo } from 'react'

import { useCheckIns } from '@/features/check-ins/hooks/useCheckIns'
import {
  deriveStreak,
  type StreakResult,
} from '@/features/check-ins/utils/streak-derive'

/*
 * useStreak — the dashboard's headline number.
 *
 * Reads the check-ins list and derives the streak in memory. The derivation
 * is pure (see streak-derive.ts) and tested in isolation; this hook is the
 * thin React shell that glues it to the data fetch.
 *
 * Returns the full StreakResult plus loading/error state from the underlying
 * query. The dashboard renders different visuals for:
 *   - isLoading: skeleton
 *   - empty (count=0, !isBroken): "Your first check-in is your streak"
 *   - active streak: count + tier fires
 *   - broken (isBroken): "You missed last week. Best was N weeks"
 */
export interface UseStreakResult extends StreakResult {
  isLoading: boolean
  error: Error | null
}

export function useStreak(): UseStreakResult {
  const query = useCheckIns()
  const streak = useMemo(
    () => deriveStreak(query.data?.check_ins, new Date()),
    [query.data],
  )
  return {
    ...streak,
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  }
}
