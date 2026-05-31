import { useMemo } from 'react'

import { useCheckIns } from '@/features/check-ins/hooks/useCheckIns'
import { weekShortLabel } from '@/features/progress/utils/format-week'

/*
 * useProgressData — single source of derived data for the /progress page.
 *
 * Both the trend charts and the photo timeline are projections of the user's
 * check-in history, which we already fetch once via `useCheckIns()`. Rather
 * than each feature re-deriving, this hook does it ONCE and hands back
 * ready-to-render series + photo entries.
 *
 * Time order: charts read left-to-right oldest→newest (chronological is the
 * intuitive scan for a trend). The backend lists DESC (newest first), so we
 * reverse here. The photo timeline keeps newest-first (the "most recent" is
 * the first thumbnail you see — the way you'd flip through a phone roll).
 *
 * Empty + loading semantics:
 *   - isLoading: still fetching → page shows skeletons.
 *   - totalCheckIns: at least one check-in exists → series can render with
 *     null gaps; otherwise render an empty-state card.
 *
 * Pure derivation, NO async work — the async lives in `useCheckIns`.
 */

export interface TrendPoint {
  /** YYYY-MM-DD (Monday of the week). */
  weekStartDate: string
  /** Short label like "Jun 2" for the X-axis tick. */
  label: string
  /** Metric value or null when missing — Recharts skips nulls in the line. */
  value: number | null
}

export interface PhotoEntry {
  /** Stable key for React lists (URL is fine — same photo URL twice would be a backend bug). */
  url: string
  /** Friendly week label like "Jun 2" — shown under the thumbnail. */
  label: string
  /** YYYY-MM-DD Monday for screen-reader context. */
  weekStartDate: string
}

export interface ProgressData {
  isLoading: boolean
  isError: boolean
  /** Total number of check-ins fetched (regardless of which metrics they carry). */
  totalCheckIns: number
  weightSeries: TrendPoint[]
  energySeries: TrendPoint[]
  moodSeries: TrendPoint[]
  photos: PhotoEntry[]
}

export function useProgressData(): ProgressData {
  const query = useCheckIns()

  return useMemo<ProgressData>(() => {
    const isLoading = query.isLoading
    const isError = query.isError
    const raw = query.data?.check_ins ?? []

    // Backend returns DESC (newest first). For chronological charts we want
    // oldest first; spread + reverse keeps the original array untouched.
    const oldestFirst = [...raw].reverse()

    const weightSeries: TrendPoint[] = []
    const energySeries: TrendPoint[] = []
    const moodSeries: TrendPoint[] = []
    for (const ci of oldestFirst) {
      const wsd = ci.week_start_date
      if (!wsd) continue
      const label = weekShortLabel(wsd)
      weightSeries.push({
        weekStartDate: wsd,
        label,
        value: typeof ci.weight_lbs === 'number' ? ci.weight_lbs : null,
      })
      energySeries.push({
        weekStartDate: wsd,
        label,
        value: typeof ci.energy_score === 'number' ? ci.energy_score : null,
      })
      moodSeries.push({
        weekStartDate: wsd,
        label,
        value: typeof ci.mood_score === 'number' ? ci.mood_score : null,
      })
    }

    // Photos: newest-first (backend order). Flatten each check-in's photo_urls
    // into one stream of entries; some weeks have multiple photos, some have
    // none. The label is shared across photos from the same check-in week.
    const photos: PhotoEntry[] = []
    for (const ci of raw) {
      const wsd = ci.week_start_date
      const urls = ci.photo_urls ?? []
      if (!wsd || urls.length === 0) continue
      const label = weekShortLabel(wsd)
      for (const url of urls) {
        photos.push({ url, label, weekStartDate: wsd })
      }
    }

    return {
      isLoading,
      isError,
      totalCheckIns: raw.length,
      weightSeries,
      energySeries,
      moodSeries,
      photos,
    }
  }, [query.data, query.isLoading, query.isError])
}
