import { http, HttpResponse } from 'msw'

/*
 * Default MSW handlers for the test suite.
 *
 * These cover the happy paths that hooks/components hit by default —
 * tests that need a specific failure or non-default body call
 * `server.use(...)` to override before exercising.
 *
 * Conventions:
 *   - Use absolute URLs anchored to TEST_BASE_URL (http://localhost), since
 *     the test client is configured with that origin.
 *   - Return shapes mirror the Go backend exactly. If a handler drifts from
 *     the OpenAPI spec, the runtime test would still pass but actual code
 *     in prod could fail — keep these honest.
 */

const BASE = 'http://localhost'

/** A canonical login response used by the auth + spine tests. */
export const SAMPLE_LOGIN_RESPONSE = {
  access_token: 'access-token-A',
  refresh_token: 'refresh-token-A',
  expires_at: '2099-01-01T00:00:00Z',
  client_id: 'client-uuid-1',
  coach_id: 'coach-uuid-1',
}

/** A canonical refresh response (different tokens so tests can detect rotation). */
export const SAMPLE_REFRESH_RESPONSE = {
  access_token: 'access-token-B',
  refresh_token: 'refresh-token-B',
  expires_at: '2099-01-01T00:00:00Z',
  client_id: 'client-uuid-1',
}

export const handlers = [
  // Auth
  http.post(`${BASE}/api/v1/portal/auth/login`, () =>
    HttpResponse.json(SAMPLE_LOGIN_RESPONSE),
  ),
  http.post(`${BASE}/api/v1/portal/auth/refresh`, () =>
    HttpResponse.json(SAMPLE_REFRESH_RESPONSE),
  ),
  http.post(`${BASE}/api/v1/portal/auth/logout`, () =>
    HttpResponse.json({}, { status: 200 }),
  ),

  // Me
  http.get(`${BASE}/api/v1/portal/me`, () =>
    HttpResponse.json({
      first_name: 'Sam',
      last_name: 'Rivera',
      coach_name: 'Marcus Holloway',
      program_week: 5,
      program_total: 12,
    }),
  ),

  // Check-ins (empty list by default — tests opt-in to seeded data)
  http.get(`${BASE}/api/v1/portal/check-ins`, () =>
    HttpResponse.json({
      check_ins: [],
      page: 1,
      per_page: 100,
      total: 0,
      total_pages: 0,
    }),
  ),
  http.post(`${BASE}/api/v1/portal/check-ins`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({
      id: 'check-in-1',
      week_start_date: body.week_start_date,
      submitted_at: '2026-05-31T10:00:00Z',
      ...body,
    })
  }),

  // Notifications
  http.get(`${BASE}/api/v1/portal/notifications/unread-count`, () =>
    HttpResponse.json({ count: 0 }),
  ),
  http.get(`${BASE}/api/v1/portal/notifications`, () =>
    HttpResponse.json({
      notifications: [],
      page: 1,
      per_page: 100,
      total: 0,
      total_pages: 0,
    }),
  ),

  // Uploads — default success with `{ url }`
  http.post(`${BASE}/api/v1/portal/uploads/photo`, () =>
    HttpResponse.json({
      url: 'https://cdn.example.com/fitcoach/progress-photos/abc.jpg',
    }),
  ),

  // WS ticket — default success
  http.post(`${BASE}/api/v1/portal/ws/ticket`, () =>
    HttpResponse.json({
      ticket: 'ws-ticket-1',
      expires_at: '2099-01-01T00:00:00Z',
    }),
  ),
]
