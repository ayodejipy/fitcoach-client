import { createFileRoute } from '@tanstack/react-router'

/*
 * `/accept-invite?token=...` — set password on first arrival (placeholder shell).
 *
 * Real implementation lands with Task T4 (auth spine) + Decision 6A
 * (cold-start): coach-named welcome from invite payload, password
 * + confirm-password fields, "Set password & continue."
 */
export const Route = createFileRoute('/_auth/accept-invite')({
  component: AcceptInvitePage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
})

function AcceptInvitePage() {
  const { token } = Route.useSearch()
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <h1 className="text-[20px] font-bold tracking-tight text-foreground">
        Set your password
      </h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">
        You'll check in each Sunday and your coach will reply within a day.
      </p>
      <p className="mt-6 rounded-md bg-muted px-3 py-2 text-[12.5px] text-muted-foreground">
        Accept-invite form coming in Task T4 (auth spine).
        {token ? ` Token detected: ${token.slice(0, 8)}…` : ' No token in URL.'}
      </p>
    </div>
  )
}
