import { useQuery } from '@tanstack/react-query'

import { portalListSessionsOptions } from '@/lib/api/generated/@tanstack/react-query.gen'

/*
 * useSessions — paginated list of the client's own sessions.
 *
 * Backend default per_page=20, max 100. We default to 100 here so a single
 * fetch covers everything any realistic client has on file (upcoming + recent
 * past) without paging concerns in v1.
 *
 * `from` and `to` are RFC3339 bounds. Default omitted → backend returns the
 * full list it knows about; the `categorizeSessions` util splits them client-
 * side. If a power user accumulates years of sessions we'll add a date-range
 * filter; for now per_page=100 is the simpler design.
 */
interface Opts {
  perPage?: number
  page?: number
  /** RFC3339 lower bound (inclusive). */
  from?: string
  /** RFC3339 upper bound (exclusive). */
  to?: string
}

export function useSessions(opts: Opts = {}) {
  return useQuery(
    portalListSessionsOptions({
      query: {
        per_page: opts.perPage ?? 100,
        page: opts.page ?? 1,
        from: opts.from,
        to: opts.to,
      },
    }),
  )
}
