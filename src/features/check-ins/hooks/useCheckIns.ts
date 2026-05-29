import { useQuery } from '@tanstack/react-query'

import { portalListCheckInsOptions } from '@/lib/api/generated/@tanstack/react-query.gen'

/*
 * useCheckIns — paginated list of the client's own check-ins.
 *
 * Defaults to per_page=100 (the backend cap) — that gives ~2 years of weekly
 * history in one request, which is more than enough to derive any realistic
 * streak from a single fetch. If the streak EVER touches the 100-week edge
 * (a very nice problem to have), the streak hook signals `reachedListEnd`
 * and we can implement page-2 fetching then.
 *
 * Sort order: backend returns DESC by week_start_date (newest first), which
 * is exactly what `deriveStreak` walks. We don't re-sort here.
 */
export function useCheckIns(opts: { perPage?: number; page?: number } = {}) {
  return useQuery(
    portalListCheckInsOptions({
      query: {
        per_page: opts.perPage ?? 100,
        page: opts.page ?? 1,
      },
    }),
  )
}
