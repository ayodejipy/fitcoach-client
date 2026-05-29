import { createFileRoute, Link } from '@tanstack/react-router'

import { AcceptInviteForm } from '@/features/auth/components/AcceptInviteForm'

/*
 * `/accept-invite?token=...` — first-time portal setup (Decision 6A cold-start).
 *
 * The token comes from the email link the coach sent. Without it we can't
 * complete the invite, so we render a friendly fallback that points the user
 * back at their coach (rather than crashing or showing an empty form).
 */
export const Route = createFileRoute('/_auth/accept-invite')({
  component: AcceptInvitePage,
  validateSearch: (search: Record<string, unknown>) => {
    // Keep the key out of the output when missing — gives an optional type.
    const out: { token?: string } = {}
    if (typeof search.token === 'string') out.token = search.token
    return out
  },
})

function AcceptInvitePage() {
  const { token } = Route.useSearch()

  if (!token) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-[20px] font-bold tracking-tight text-foreground">
          That link looks incomplete
        </h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Open the original email from your coach and tap the invite button —
          it includes the token this page needs.
        </p>
        <div className="mt-5">
          <Link
            to="/login"
            className="text-[13.5px] font-semibold text-primary hover:underline"
          >
            Already have an account? Sign in →
          </Link>
        </div>
      </div>
    )
  }

  return <AcceptInviteForm token={token} />
}
