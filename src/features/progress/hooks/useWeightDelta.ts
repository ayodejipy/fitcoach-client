import { useMemo } from 'react'

import { useCheckIns } from '@/features/check-ins/hooks/useCheckIns'

/*
 * useWeightDelta — derives the "−6.2 lbs since Week 1" hero stat for the
 * Progress page.
 *
 * Reads all check-ins, finds the earliest one with a weight reading and the
 * most recent one with a weight reading, returns the delta (latest − first)
 * plus the latest weight itself.
 *
 * Returns null when there isn't enough data:
 *   - 0 or 1 check-ins with weight (no delta possible)
 *   - all weights are null
 *
 * Pure derivation, no extra fetch — composes the same useCheckIns query.
 */

export interface WeightDelta {
  /** The change in lbs (latest − first). Negative = weight loss. */
  deltaLbs: number
  /** The most recent weight reading. */
  latestLbs: number
  /** The earliest weight reading. */
  startingLbs: number
}

export function useWeightDelta(): WeightDelta | null {
  const query = useCheckIns()

  return useMemo(() => {
    const checkIns = query.data?.check_ins ?? []
    if (checkIns.length < 2) return null

    // Backend returns DESC by week_start_date; flip to ASC so first = earliest.
    const oldestFirst = [...checkIns].reverse()
    const withWeight = oldestFirst.filter(
      (checkIn) => typeof checkIn.weight_lbs === 'number',
    )
    if (withWeight.length < 2) return null

    const startingLbs = withWeight[0]!.weight_lbs as number
    const latestLbs = withWeight[withWeight.length - 1]!.weight_lbs as number
    return {
      startingLbs,
      latestLbs,
      deltaLbs: Math.round((latestLbs - startingLbs) * 10) / 10,
    }
  }, [query.data])
}
