import { useQuery } from '@tanstack/react-query'

import { portalListPaymentsOptions } from '@/lib/api/generated/@tanstack/react-query.gen'

/*
 * usePayments — paginated list of the client's own payments / invoices.
 *
 * Backend default per_page=20, max 100. Default to 100 here (matches the
 * pattern set by useSessions + useCheckIns) — one fetch covers any realistic
 * billing history without paging concerns in v1.
 */
interface Opts {
  perPage?: number
  page?: number
}

export function usePayments(opts: Opts = {}) {
  return useQuery(
    portalListPaymentsOptions({
      query: {
        per_page: opts.perPage ?? 100,
        page: opts.page ?? 1,
      },
    }),
  )
}
