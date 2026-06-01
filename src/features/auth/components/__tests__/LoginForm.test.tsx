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

import { LoginForm } from '@/features/auth/components/LoginForm'
import { useTokensStore } from '@/stores/tokens'

import { SAMPLE_LOGIN_RESPONSE } from '@/test/msw/handlers'
import { server, TEST_BASE_URL } from '@/test/msw/server'
import {
  createTestQueryClient,
  withQueryClient,
} from '@/test/react-helpers'
import { configureTestClient } from '@/test/test-client'

/*
 * LoginForm.test — UI-level smoke of the auth entry point.
 *
 * What we verify here:
 *   - Empty submit shows inline validation messages (RHF + Zod wired right).
 *   - 200 success → tokens land in the store, navigate fires with /dashboard
 *     (or the redirect search param if one was set).
 *   - 401 from backend → "wrong email or password" message pins to the
 *     password field; toaster stays quiet.
 *   - 5xx → toast.error fires; no field-level error.
 *
 * Router + sonner are mocked at the module level — the form doesn't need a
 * real route tree to be exercised, and the router context is what makes
 * useLogin's useSearch / useNavigate work.
 */

const mockNavigate = vi.fn()
const mockSearch = vi.fn(() => ({ redirect: undefined as string | undefined }))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearch(),
}))

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

const { toast } = await import('sonner')

const LOGIN_URL = `${TEST_BASE_URL}/api/v1/portal/auth/login`

function renderLoginForm() {
  const queryClient = createTestQueryClient()
  return render(<LoginForm />, { wrapper: withQueryClient(queryClient) })
}

describe('<LoginForm />', () => {
  beforeAll(() => {
    configureTestClient()
  })

  beforeEach(() => {
    useTokensStore.getState().clearTokens()
    mockNavigate.mockReset()
    mockSearch.mockReset()
    mockSearch.mockReturnValue({ redirect: undefined })
    ;(toast.error as ReturnType<typeof vi.fn>).mockReset()
    ;(toast.success as ReturnType<typeof vi.fn>).mockReset()
  })

  afterEach(() => {
    useTokensStore.getState().clearTokens()
  })

  it('renders the headline + email + password + submit', () => {
    renderLoginForm()
    expect(
      screen.getByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows inline validation when submitting empty fields', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // The Zod schema requires both email and password — empty submit should
    // produce a password-required message (and an email message); we just
    // assert one of them lands so we're not coupled to schema copy changes.
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('on 200 success, sets tokens and navigates to /dashboard', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/email/i), 'sam@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(useTokensStore.getState().accessToken).toBe(
        SAMPLE_LOGIN_RESPONSE.access_token,
      )
    })
    expect(useTokensStore.getState().refreshToken).toBe(
      SAMPLE_LOGIN_RESPONSE.refresh_token,
    )
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/dashboard',
      replace: true,
    })
  })

  it('honors the redirect search param when present', async () => {
    mockSearch.mockReturnValue({ redirect: '/check-in' })

    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/email/i), 'sam@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/check-in',
        replace: true,
      })
    })
  })

  it('on 401, surfaces backend copy inline on the password field; no toast', async () => {
    server.use(
      http.post(LOGIN_URL, () =>
        HttpResponse.json(
          {
            code: 'INVALID_CREDENTIALS',
            error: 'invalid email or password',
          },
          { status: 401 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/email/i), 'sam@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong-pw')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/invalid email or password/i),
      ).toBeInTheDocument()
    })
    expect(toast.error).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('on 500, fires toast.error with backend message; no inline', async () => {
    server.use(
      http.post(LOGIN_URL, () =>
        HttpResponse.json(
          { code: 'INTERNAL', error: 'database connection lost' },
          { status: 500 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/email/i), 'sam@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('database connection lost')
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('disables the submit button while the mutation is in flight', async () => {
    // Hold the response open so we can observe the disabled state mid-flight.
    let resolveResponse: () => void = () => {}
    server.use(
      http.post(LOGIN_URL, async () => {
        await new Promise<void>((resolve) => {
          resolveResponse = resolve
        })
        return HttpResponse.json(SAMPLE_LOGIN_RESPONSE)
      }),
    )

    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/email/i), 'sam@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submit = screen.getByRole('button', { name: /sign in/i })
    await user.click(submit)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /signing in/i }),
      ).toBeDisabled()
    })

    resolveResponse()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled())
  })
})
