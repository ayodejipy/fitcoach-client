import { useQuery } from '@tanstack/react-query'

import { portalGetMeOptions } from '@/lib/api/generated/@tanstack/react-query.gen'

/*
 * useMe — fetch the authenticated client's profile + coach mini.
 *
 * Thin wrapper around the generated `portalGetMeOptions()` so feature code
 * never imports the generated query helpers directly. Matches the
 * features/<domain>/hooks/use<Action>.ts convention from MEMORY.
 *
 * `data` shape (from openapi.json):
 *   first_name, last_name, email, phone
 *   goal, plan_name, status, program_week, program_total, start_date
 *   coach_id, coach_name, coach_avatar, coach_bio, coach_business
 *
 * Cache: default staleTime from query-client.ts (30s) — fresh enough that
 * the dashboard reflects coach mini changes within a tab focus, infrequent
 * enough that we don't refetch on every render.
 */
export function useMe() {
  return useQuery(portalGetMeOptions())
}
