import { useMemo } from 'react'

import { useCheckIns } from '@/features/check-ins/hooks/useCheckIns'
import { useStreak } from '@/features/check-ins/hooks/useStreak'

export interface ThisWeekStats {
  /** True when there's a check-in for this ISO Monday. */
  submitted: boolean
  isLoading: boolean
  sleepHrs: number | null
  energyScore: number | null
  moodScore: number | null
}

export function useThisWeekStats(): ThisWeekStats {
  const query = useCheckIns()
  const streak = useStreak()

  return useMemo(() => {
    const isLoading = query.isLoading || streak.isLoading
    const checkIns = query.data?.check_ins ?? []
    const thisWeekCheckIn = checkIns.find(
      (checkIn) => checkIn.week_start_date === streak.thisMonday,
    )
    if (!thisWeekCheckIn) {
      return {
        submitted: false,
        isLoading,
        sleepHrs: null,
        energyScore: null,
        moodScore: null,
      }
    }
    return {
      submitted: true,
      isLoading,
      sleepHrs:
        typeof thisWeekCheckIn.sleep_hrs === 'number'
          ? thisWeekCheckIn.sleep_hrs
          : null,
      energyScore:
        typeof thisWeekCheckIn.energy_score === 'number'
          ? thisWeekCheckIn.energy_score
          : null,
      moodScore:
        typeof thisWeekCheckIn.mood_score === 'number'
          ? thisWeekCheckIn.mood_score
          : null,
    }
  }, [query.data, query.isLoading, streak.thisMonday, streak.isLoading])
}
