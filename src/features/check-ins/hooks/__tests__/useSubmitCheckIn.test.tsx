import { http, HttpResponse } from 'msw'
import { renderHook, waitFor } from '@testing-library/react'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { useSubmitCheckIn } from '@/features/check-ins/hooks/useSubmitCheckIn'
import { useCelebrationStore } from '@/stores/celebration'
import { useTokensStore } from '@/stores/tokens'

import { server, TEST_BASE_URL } from '@/test/msw/server'
import {
  createTestQueryClient,
  withQueryClient,
} from '@/test/react-helpers'
import { configureTestClient } from '@/test/test-client'

/*
 * useSubmitCheckIn.test — the post-submit ladder:
 *
 *   On 200 (happy):
 *     1. Celebration payload pushed (computed from streak-before + new count)
 *     2. Success toast fired
 *     3. Navigate to /dashboard
 *
 *   On 400/401/422 (field-level):
 *     - onInlineError called with the backend message
 *     - NO toast, NO navigate
 *
 *   On 5xx / network:
 *     - toast.error called with the AppError message
 *     - NO inline, NO navigate
 *
 * Streak math is tested in streak-derive.test; here we just verify the
 * NEW count/tier passed to the celebration matches the "prev + 1" rule
 * (or "1" on a broken-restart).
 *
 * Mocks:
 *   - sonner.toast → vi.fn so we can assert on calls
 *   - @tanstack/react-router useNavigate → vi.fn (route tree not mounted here)
 *
 * Determinism: vi.setSystemTime pins "now" to Wed 2026-05-13 so the
 * ISO Monday is 2026-05-11 — used to seed the check-ins fixture so
 * `streak.hasSubmittedThisWeek === false` and the next submit makes it
 * count = 4 (3 prior weeks + this one).
 */

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Imported AFTER the vi.mock above so we get the mocked toast.
const { toast } = await import('sonner')

const SUBMIT_URL = `${TEST_BASE_URL}/api/v1/portal/check-ins`
const LIST_URL = `${TEST_BASE_URL}/api/v1/portal/check-ins`

// NOW = Wed 2026-05-13 → this ISO Monday = 2026-05-11
const NOW = new Date(2026, 4, 13, 10, 0, 0) // local TZ Wed
const THIS_MONDAY = '2026-05-11'

/** Build a single check-in fixture with required week_start_date. */
function ci(week_start_date: string) {
  return {
    id: `ci-${week_start_date}`,
    week_start_date,
    weight_lbs: 180,
    energy_score: 7,
    mood_score: 8,
    submitted_at: '2026-05-04T10:00:00Z',
  }
}

/** Backend returns DESC (newest first). Three consecutive prior weeks. */
const SEEDED_CHECK_INS = [
  ci('2026-05-04'), // week before this one
  ci('2026-04-27'),
  ci('2026-04-20'),
]

function renderHarness() {
  const queryClient = createTestQueryClient()
  return renderHook(() => useSubmitCheckIn(), {
    wrapper: withQueryClient(queryClient),
  })
}

describe('useSubmitCheckIn', () => {
  beforeAll(() => {
    configureTestClient()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(NOW)
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  beforeEach(() => {
    useTokensStore.getState().setTokens({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    })
    useCelebrationStore.getState().dismiss()
    mockNavigate.mockReset()
    ;(toast.success as ReturnType<typeof vi.fn>).mockReset()
    ;(toast.error as ReturnType<typeof vi.fn>).mockReset()

    // Default: seed list so streak = 3 (active, has not submitted this week)
    server.use(
      http.get(LIST_URL, () =>
        HttpResponse.json({
          check_ins: SEEDED_CHECK_INS,
          page: 1,
          per_page: 100,
          total: SEEDED_CHECK_INS.length,
          total_pages: 1,
        }),
      ),
    )
  })

  afterEach(() => {
    useTokensStore.getState().clearTokens()
    useCelebrationStore.getState().dismiss()
  })

  describe('on successful submit', () => {
    it('pushes a celebration payload with newCount = prevCount + 1', async () => {
      const { result } = renderHarness()

      // Wait for the streak query to settle so streakBefore is non-zero.
      await waitFor(() => {
        expect(result.current).toBeDefined()
      })
      // Give the inner useStreak query one microtask to read MSW data.
      await new Promise((r) => setTimeout(r, 10))

      result.current.submit({
        week_start_date: THIS_MONDAY,
        weight_lbs: 178,
        energy_score: 8,
        mood_score: 9,
      })

      await waitFor(() => {
        expect(useCelebrationStore.getState().pending).not.toBeNull()
      })

      const payload = useCelebrationStore.getState().pending!
      // Prior 3 consecutive weeks → submit this Monday → count goes 3 → 4.
      expect(payload.prevCount).toBe(3)
      expect(payload.newCount).toBe(4)
      // Tiers: 1-2 → tier 1, 3-6 → tier 2. So prevTier=2, newTier=2.
      expect(payload.prevTier).toBe(2)
      expect(payload.newTier).toBe(2)
    })

    it('shows the success toast and navigates to /dashboard', async () => {
      const { result } = renderHarness()
      await new Promise((r) => setTimeout(r, 10))

      result.current.submit({
        week_start_date: THIS_MONDAY,
        weight_lbs: 178,
        energy_score: 8,
        mood_score: 9,
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })
      expect(toast.success).toHaveBeenCalledWith('Week logged. Nice work.')
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/dashboard',
        replace: true,
      })
    })

    it('uses newCount = 1 when the prior streak was broken', async () => {
      // Stale check-ins (older than 2 weeks back) → streak.isBroken = true
      server.use(
        http.get(LIST_URL, () =>
          HttpResponse.json({
            check_ins: [ci('2026-03-02'), ci('2026-02-23')],
            page: 1,
            per_page: 100,
            total: 2,
            total_pages: 1,
          }),
        ),
      )

      const { result } = renderHarness()
      await new Promise((r) => setTimeout(r, 10))

      result.current.submit({
        week_start_date: THIS_MONDAY,
        weight_lbs: 178,
        energy_score: 8,
        mood_score: 9,
      })

      await waitFor(() => {
        expect(useCelebrationStore.getState().pending).not.toBeNull()
      })

      const payload = useCelebrationStore.getState().pending!
      // Broken streak → fresh start. prevCount becomes 0, newCount = 1.
      expect(payload.prevCount).toBe(0)
      expect(payload.newCount).toBe(1)
      expect(payload.newTier).toBe(1) // tier(1) = 1
    })
  })

  describe('on field-level errors (400/401/422)', () => {
    it.each([[400], [401], [422]])(
      '%i: calls onInlineError with the backend message; no toast, no navigate',
      async (status) => {
        server.use(
          http.post(SUBMIT_URL, () =>
            HttpResponse.json(
              { code: 'DUPLICATE_WEEK', error: "you've already checked in this week" },
              { status },
            ),
          ),
        )

        const onInlineError = vi.fn()
        const { result } = renderHarness()
        await new Promise((r) => setTimeout(r, 10))

        result.current.submit(
          {
            week_start_date: THIS_MONDAY,
            weight_lbs: 178,
            energy_score: 8,
            mood_score: 9,
          },
          { onInlineError },
        )

        await waitFor(() => {
          expect(onInlineError).toHaveBeenCalled()
        })
        expect(onInlineError).toHaveBeenCalledWith(
          "you've already checked in this week",
        )
        expect(toast.success).not.toHaveBeenCalled()
        expect(toast.error).not.toHaveBeenCalled()
        expect(mockNavigate).not.toHaveBeenCalled()
        expect(useCelebrationStore.getState().pending).toBeNull()
      },
    )
  })

  describe('on server errors (5xx)', () => {
    it('500: shows toast.error with backend message; no inline, no navigate', async () => {
      server.use(
        http.post(SUBMIT_URL, () =>
          HttpResponse.json(
            { code: 'INTERNAL', error: 'database connection lost' },
            { status: 500 },
          ),
        ),
      )

      const onInlineError = vi.fn()
      const { result } = renderHarness()
      await new Promise((r) => setTimeout(r, 10))

      result.current.submit(
        {
          week_start_date: THIS_MONDAY,
          weight_lbs: 178,
          energy_score: 8,
          mood_score: 9,
        },
        { onInlineError },
      )

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
      expect(toast.error).toHaveBeenCalledWith('database connection lost')
      expect(onInlineError).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
