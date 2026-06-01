import { render, screen } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { NextSessionCard } from '@/features/sessions/components/NextSessionCard'

/*
 * NextSessionCard.test — branch coverage for the dashboard card.
 *
 * Three branches:
 *   - loading: animated skeleton bar
 *   - empty:   inline empty-state line + "See all" link
 *   - has-session: card with title / date label / time range; Join button
 *     only when zoom_link is present
 *
 * Date labels are deterministic because we pin NOW to Wed 2026-05-13:
 *   - "Today" if starts_at is 2026-05-13
 *   - "Tomorrow" if 2026-05-14
 *   - "Thu, May 21" for later this year
 *
 * Router Link is mocked to a plain anchor — we don't need a router context.
 */

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string
    children: React.ReactNode
  } & Record<string, unknown>) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

const NOW = new Date(2026, 4, 13, 10, 0, 0)

describe('<NextSessionCard />', () => {
  beforeAll(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(NOW)
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('renders a skeleton when loading', () => {
    const { container } = render(
      <NextSessionCard
        nextSession={{ session: null, isLoading: true, isError: false }}
      />,
    )

    // The skeleton is the only top-level element; we assert on its animate-pulse class.
    const skeleton = container.firstElementChild
    expect(skeleton?.className).toMatch(/animate-pulse/)
  })

  it('renders the empty state with a "See all" link when no upcoming session', () => {
    render(
      <NextSessionCard
        nextSession={{ session: null, isLoading: false, isError: false }}
      />,
    )

    expect(screen.getByText(/no upcoming session/i)).toBeInTheDocument()
    const seeAll = screen.getByRole('link', { name: /see all/i })
    expect(seeAll).toHaveAttribute('href', '/sessions')
  })

  it('renders title, "Today" date, and time range for a session today', () => {
    const todayAt230pm = new Date(2026, 4, 13, 14, 30, 0).toISOString()
    render(
      <NextSessionCard
        nextSession={{
          isLoading: false,
          isError: false,
          session: {
            id: 'sess-1',
            title: '1:1 strength review',
            starts_at: todayAt230pm,
            duration_mins: 45,
          },
        }}
      />,
    )

    expect(
      screen.getByRole('heading', { name: /1:1 strength review/i }),
    ).toBeInTheDocument()
    // dateLabel + " · " + timeRange
    expect(screen.getByText(/today/i)).toBeInTheDocument()
    expect(screen.getByText(/45 min/i)).toBeInTheDocument()
  })

  it('renders "Tomorrow" for a session 1 day out', () => {
    const tomorrow10am = new Date(2026, 4, 14, 10, 0, 0).toISOString()
    render(
      <NextSessionCard
        nextSession={{
          isLoading: false,
          isError: false,
          session: {
            id: 'sess-2',
            title: 'Form check',
            starts_at: tomorrow10am,
          },
        }}
      />,
    )

    expect(screen.getByText(/tomorrow/i)).toBeInTheDocument()
  })

  it('renders a Join link when zoom_link is set', () => {
    const todayAt230pm = new Date(2026, 4, 13, 14, 30, 0).toISOString()
    render(
      <NextSessionCard
        nextSession={{
          isLoading: false,
          isError: false,
          session: {
            id: 'sess-1',
            title: 'Coaching call',
            starts_at: todayAt230pm,
            zoom_link: 'https://zoom.example/abc',
          },
        }}
      />,
    )

    const join = screen.getByRole('link', { name: /join/i })
    expect(join).toHaveAttribute('href', 'https://zoom.example/abc')
    expect(join).toHaveAttribute('target', '_blank')
  })

  it('does NOT render the Join link when zoom_link is missing', () => {
    const todayAt230pm = new Date(2026, 4, 13, 14, 30, 0).toISOString()
    render(
      <NextSessionCard
        nextSession={{
          isLoading: false,
          isError: false,
          session: {
            id: 'sess-3',
            title: 'In-person session',
            starts_at: todayAt230pm,
          },
        }}
      />,
    )

    expect(screen.queryByRole('link', { name: /join/i })).not.toBeInTheDocument()
  })

  it('falls back to session_type when title is blank', () => {
    const todayAt230pm = new Date(2026, 4, 13, 14, 30, 0).toISOString()
    render(
      <NextSessionCard
        nextSession={{
          isLoading: false,
          isError: false,
          session: {
            id: 'sess-4',
            title: '',
            session_type: 'consultation',
            starts_at: todayAt230pm,
          },
        }}
      />,
    )

    expect(
      screen.getByRole('heading', { name: /consultation/i }),
    ).toBeInTheDocument()
  })
})
