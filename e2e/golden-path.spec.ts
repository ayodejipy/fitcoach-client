import { test, expect, type Page } from '@playwright/test'

/*
 * golden-path.spec — end-to-end smoke of the spine flow:
 *
 *   1. Land on /login (auth gate redirects from /).
 *   2. Type credentials, submit → tokens set in localStorage.
 *   3. Land on /dashboard, greeting + streak hero render.
 *   4. Tap "Start check-in" → /check-in form.
 *   5. Fill weight + energy + mood, submit.
 *   6. Land back on /dashboard with the celebration sheet visible.
 *
 * Network is mocked at the page.route layer — the spine network contract is
 * already tested by Vitest+msw; this spec exercises the user flow, not the
 * SDK plumbing. If a real backend test is wanted, set E2E_LIVE=1 and the
 * mocks short-circuit.
 */

const ORIGIN = 'http://localhost:5173'

/** Install canned responses for every endpoint the golden path touches. */
async function mockBackend(page: Page) {
  if (process.env.E2E_LIVE) return

  await page.route(`${ORIGIN}/api/v1/portal/auth/login`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'access-e2e',
        refresh_token: 'refresh-e2e',
        expires_at: '2099-01-01T00:00:00Z',
        client_id: 'client-uuid-e2e',
      }),
    })
  })

  await page.route(`${ORIGIN}/api/v1/portal/me`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        first_name: 'Sam',
        last_name: 'Rivera',
        coach_name: 'Marcus Holloway',
        program_week: 5,
        program_total: 12,
      }),
    })
  })

  // useCheckIns + useStreak + useProgressData all share this query key.
  await page.route(
    /\/api\/v1\/portal\/check-ins(\?.*)?$/,
    async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            check_ins: [],
            page: 1,
            per_page: 100,
            total: 0,
            total_pages: 0,
          }),
        })
        return
      }
      // POST submit
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'check-in-e2e',
          week_start_date: '2026-05-11',
          submitted_at: '2026-05-13T10:00:00Z',
        }),
      })
    },
  )

  await page.route(
    `${ORIGIN}/api/v1/portal/notifications/unread-count`,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 0 }),
      })
    },
  )

  await page.route(`${ORIGIN}/api/v1/portal/sessions*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        sessions: [],
        page: 1,
        per_page: 100,
        total: 0,
        total_pages: 0,
      }),
    })
  })

  // Notifications list — the dashboard's RecentCoachReply + the /messages
  // inbox both query this. Without a mock the request falls through to the
  // real backend, 401s the fake token, and the auth interceptor wipes the
  // session before the next nav.
  await page.route(
    /\/api\/v1\/portal\/notifications(\?.*)?$/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [],
          page: 1,
          per_page: 100,
          total: 0,
          total_pages: 0,
        }),
      })
    },
  )

  // WS ticket — fulfilled but the actual WS upgrade is silently dropped
  // by Playwright (we don't intercept ws://). The hook will retry; that's
  // fine for the golden path.
  await page.route(`${ORIGIN}/api/v1/portal/ws/ticket`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ticket: 'ws-ticket-e2e',
        expires_at: '2099-01-01T00:00:00Z',
      }),
    })
  })
}

test.beforeEach(async ({ page }) => {
  await mockBackend(page)
})

test('login → dashboard → check-in → celebration', async ({ page }) => {
  await page.goto('/')

  // Auth gate redirects unauthenticated users to /login.
  await expect(page).toHaveURL(/\/login/)
  await expect(
    page.getByRole('heading', { name: /welcome back/i }),
  ).toBeVisible()

  // Sign in.
  await page.getByLabel(/email/i).fill('sam@example.com')
  await page.getByLabel(/password/i).fill('password123')
  await page.getByRole('button', { name: /sign in/i }).click()

  // Land on dashboard. Heading varies by time of day: "Good morning|afternoon|
  // evening|night, Sam." for waking hours, or "Late night, Sam." for the 0-5am
  // bucket — the regex covers both prefixes so the suite passes around the clock.
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(
    page.getByRole('heading', {
      name: /(good (morning|afternoon|evening|night)|late night)/i,
    }),
  ).toBeVisible()

  // The ThisWeekCard renders a "Start check-in" link when not submitted.
  await page.getByRole('link', { name: /start check-in/i }).first().click()

  // Land on /check-in. The Fraunces page headline is "How was your week?";
  // the "Week N check-in" string lives in an eyebrow above it, not in the H1.
  await expect(page).toHaveURL(/\/check-in/)
  await expect(
    page.getByRole('heading', { name: /how was your week/i }),
  ).toBeVisible()

  // Fill the required fields.
  await page.getByLabel(/weight \(lbs\)/i).fill('180')
  // Pick energy=7 and mood=8. Each score scale has 10 radios; first set is
  // energy (above), second set is mood (below).
  await page.getByRole('radio', { name: '7 of 10' }).first().click()
  await page.getByRole('radio', { name: '8 of 10' }).nth(1).click()

  await page.getByRole('button', { name: /submit check-in/i }).click()

  // After submit, we navigate back to dashboard AND the celebration sheet renders.
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(
    page.getByRole('dialog', { name: /check-in submitted/i }),
  ).toBeVisible({ timeout: 3_000 })

  // Sheet auto-dismisses after ~1.5s; advancing past that, it disappears.
  await expect(
    page.getByRole('dialog', { name: /check-in submitted/i }),
  ).toBeHidden({ timeout: 4_000 })
})
