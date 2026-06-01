import { http, HttpResponse } from 'msw'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { CheckInForm } from '@/features/check-ins/components/CheckInForm'
import { useCelebrationStore } from '@/stores/celebration'
import { useTokensStore } from '@/stores/tokens'

import { server, TEST_BASE_URL } from '@/test/msw/server'
import {
  createTestQueryClient,
  withQueryClient,
} from '@/test/react-helpers'
import { configureTestClient } from '@/test/test-client'

/*
 * CheckInForm.test — UI-level smoke of the weekly habit-loop form.
 *
 * What we verify:
 *   - Renders the program week label + ISO Monday friendly date.
 *   - Energy + mood score scales render 10 chips each, are role=radio.
 *   - Empty submit shows required-field errors (weight + energy + mood).
 *   - Happy submit: POSTs the form values verbatim (per_form keys), submit
 *     button disables mid-flight, navigate fires.
 *   - 409 duplicate-week error pins to weight via the form's onInlineError.
 *
 * Router + sonner mocked at module level (same pattern as LoginForm.test).
 *
 * NOW pinned to Wed 2026-05-13 via fake timers; THIS_MONDAY = '2026-05-11'.
 */

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

const SUBMIT_URL = `${TEST_BASE_URL}/api/v1/portal/check-ins`
const LIST_URL = `${TEST_BASE_URL}/api/v1/portal/check-ins`

const THIS_MONDAY = '2026-05-11'
const NOW = new Date(2026, 4, 13, 10, 0, 0)

function renderCheckInForm(props?: { programWeek?: number }) {
  const queryClient = createTestQueryClient()
  return render(
    <CheckInForm thisMonday={THIS_MONDAY} programWeek={props?.programWeek} />,
    { wrapper: withQueryClient(queryClient) },
  )
}

describe('<CheckInForm />', () => {
  beforeAll(() => {
    configureTestClient()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(NOW)
  })

  beforeEach(() => {
    useTokensStore.getState().setTokens({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    })
    useCelebrationStore.getState().dismiss()
    mockNavigate.mockReset()

    // Default list handler so the streak query in useSubmitCheckIn settles.
    server.use(
      http.get(LIST_URL, () =>
        HttpResponse.json({
          check_ins: [],
          page: 1,
          per_page: 100,
          total: 0,
          total_pages: 0,
        }),
      ),
    )
  })

  afterEach(() => {
    useTokensStore.getState().clearTokens()
    useCelebrationStore.getState().dismiss()
  })

  it('renders week label, date, headline, and all required fields', () => {
    renderCheckInForm({ programWeek: 5 })

    // Eyebrow above the headline (small uppercase brand-green text)
    expect(screen.getByText(/week 5 check-in/i)).toBeInTheDocument()
    // Fraunces page headline (replaced "Week 5 check-in" as the h1 in the redesign)
    expect(
      screen.getByRole('heading', { name: /how was your week/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/weight \(lbs\)/i)).toBeInTheDocument()
    expect(screen.getByText(/energy this week/i)).toBeInTheDocument()
    expect(screen.getByText(/mood this week/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/average sleep/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notes for your coach/i)).toBeInTheDocument()
  })

  it('renders 10 chips per score scale (energy + mood)', () => {
    renderCheckInForm()

    // Each ScoreScale exposes 10 radios with aria-label "N of 10".
    expect(screen.getAllByRole('radio', { name: /1 of 10/i })).toHaveLength(2)
    expect(screen.getAllByRole('radio', { name: /10 of 10/i })).toHaveLength(2)
  })

  it('shows validation messages on empty submit', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderCheckInForm()

    await user.click(screen.getByRole('button', { name: /submit check-in/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/how much do you weigh this week/i),
      ).toBeInTheDocument()
    })
    expect(screen.getByText(/rate your energy 1.10/i)).toBeInTheDocument()
    expect(screen.getByText(/rate your mood 1.10/i)).toBeInTheDocument()
  })

  it('on successful submit, POSTs the form values and navigates to /dashboard', async () => {
    let observedBody: Record<string, unknown> | null = null
    server.use(
      http.post(SUBMIT_URL, async ({ request }) => {
        observedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          id: 'ci-1',
          week_start_date: THIS_MONDAY,
          submitted_at: '2026-05-13T10:00:00Z',
        })
      }),
    )

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderCheckInForm()

    await user.type(screen.getByLabelText(/weight \(lbs\)/i), '180')
    // Click energy=7 (one of the two "7 of 10" radios; the first is energy).
    const sevens = screen.getAllByRole('radio', { name: /7 of 10/i })
    await user.click(sevens[0]!)
    // Click mood=8.
    const eights = screen.getAllByRole('radio', { name: /8 of 10/i })
    await user.click(eights[1]!)

    await user.click(screen.getByRole('button', { name: /submit check-in/i }))

    await waitFor(() => {
      expect(observedBody).not.toBeNull()
    })
    expect(observedBody).toMatchObject({
      week_start_date: THIS_MONDAY,
      weight_lbs: 180,
      energy_score: 7,
      mood_score: 8,
    })
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/dashboard',
        replace: true,
      })
    })
  })

  it('on 409 duplicate week, pins the backend message to the weight field', async () => {
    server.use(
      http.post(SUBMIT_URL, () =>
        HttpResponse.json(
          {
            code: 'DUPLICATE_WEEK',
            error: "you've already checked in this week",
          },
          { status: 400 },
        ),
      ),
    )

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderCheckInForm()

    await user.type(screen.getByLabelText(/weight \(lbs\)/i), '180')
    const sevens = screen.getAllByRole('radio', { name: /7 of 10/i })
    await user.click(sevens[0]!)
    const eights = screen.getAllByRole('radio', { name: /8 of 10/i })
    await user.click(eights[1]!)

    await user.click(screen.getByRole('button', { name: /submit check-in/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/you've already checked in this week/i),
      ).toBeInTheDocument()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('disables the submit button while the mutation is in flight', async () => {
    let resolveResponse: () => void = () => {}
    server.use(
      http.post(SUBMIT_URL, async () => {
        await new Promise<void>((resolve) => {
          resolveResponse = resolve
        })
        return HttpResponse.json({ id: 'ci-1' })
      }),
    )

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderCheckInForm()

    await user.type(screen.getByLabelText(/weight \(lbs\)/i), '180')
    const sevens = screen.getAllByRole('radio', { name: /7 of 10/i })
    await user.click(sevens[0]!)
    const eights = screen.getAllByRole('radio', { name: /8 of 10/i })
    await user.click(eights[1]!)

    await user.click(screen.getByRole('button', { name: /submit check-in/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /submitting/i }),
      ).toBeDisabled()
    })

    resolveResponse()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled())
  })
})
