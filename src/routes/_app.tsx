import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { useTokensStore } from '@/stores/tokens'

/*
 * `_app` layout — wraps every gated (authenticated) page.
 *
 * v1 responsive pattern (Decision 9D):
 *   - mobile (<768px): content single-column, bottom nav fixed.
 *   - desktop (>=768px): left sidebar nav, content column capped ~640px.
 *
 * Auth gate (Decision 1A + 5A): `beforeLoad` checks the Zustand tokens store
 * synchronously. The check uses `refreshToken` (not access — access is short
 * and may be expired and refreshable; the interceptor handles that case
 * transparently). If there's no refresh token, redirect to /login carrying
 * the requested URL so post-login we can return them there.
 *
 * Why read the store here instead of router context: the store is the single
 * source of truth, and a context-threaded copy would go stale across
 * login/logout. `getState()` is synchronous and cheap.
 */
export const Route = createFileRoute('/_app')({
  beforeLoad: ({ location }) => {
    if (!useTokensStore.getState().isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar (md+); hidden on mobile */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-60 md:flex-col md:border-r md:border-border md:bg-card md:px-4 md:py-6">
        <div className="text-[18px] font-extrabold tracking-tight text-foreground">
          FitCoach
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {/* Nav items render here in Task T10 (responsive sidebar) */}
          <span className="text-[12px] uppercase tracking-wider text-muted-foreground">
            Nav placeholder
          </span>
        </nav>
      </aside>

      {/* Content column (mobile + desktop) */}
      <main className="mx-auto w-full max-w-[640px] md:pl-60 pb-24 md:pb-10">
        <div className="px-5 py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav (hidden on md+) */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 h-[78px] border-t border-border bg-card flex items-center justify-around px-2 pb-4">
        {/* Nav items render here in Task T10 */}
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Bottom nav placeholder
        </span>
      </nav>
    </div>
  )
}
