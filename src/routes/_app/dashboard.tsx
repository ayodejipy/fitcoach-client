import { createFileRoute } from '@tanstack/react-router'

/*
 * `/dashboard` — the hub.
 *
 * Locked priority order (Decision 1A from /plan-design-review):
 *   1. Greeting + coach mini
 *   2. STREAK HERO with fire-tier escalation
 *   3. "This week" check-in CTA OR submitted-state
 *   4. Today's session (if any) else empty state
 *   5. Latest unread coach reply (hide if none)
 *
 * Anchored to the approved wireframe at
 * `~/.gstack/projects/ayodejipy-fitcoach-crm/designs/portal-dashboard-20260528/wireframe-dashboard.html`.
 *
 * Real implementation lands across Tasks T5 (check-in spine + streak),
 * D5 (empty states), D7 (broken-streak recovery), and D10 (sidebar nav).
 */
export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-foreground">
            Welcome
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Empty shell — dashboard renders here once Tasks T5 + D5 land.
          </p>
        </div>
      </header>

      {/* Placeholder for STREAK HERO (Task T5 + D7) */}
      <div
        className="rounded-2xl bg-[var(--green-deep)] text-white p-6 shadow-[0_12px_36px_rgba(26,122,74,0.22)]"
        aria-label="Streak hero placeholder"
      >
        <div className="text-[12px] uppercase tracking-[0.14em] text-white/55 font-semibold">
          Your streak
        </div>
        <div className="mt-2 flex items-baseline gap-3">
          <div className="text-[64px] font-extrabold leading-none tracking-tight">
            —
          </div>
          <div className="text-[17px] font-medium text-white/75">weeks</div>
        </div>
        <p className="mt-3 text-[13.5px] text-white/70">
          Your first check-in is your streak. Submit by Sunday to start.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 text-[13.5px] text-muted-foreground">
        Tokens loaded · routing live · ready to wire features.
      </div>
    </div>
  )
}
