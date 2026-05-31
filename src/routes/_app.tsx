import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { BottomNav } from '@/features/navigation/components/BottomNav'
import { Sidebar } from '@/features/navigation/components/Sidebar'
import { useNotificationsRealtime } from '@/features/notifications/hooks/useNotificationsRealtime'
import { useTokensStore } from '@/stores/tokens'

/*
 * `_app` layout — wraps every gated (authenticated) page.
 *
 * v1 responsive pattern (Decision 9D):
 *   - mobile (<md): single column, bottom nav fixed.
 *   - desktop (md+): left sidebar nav, content column capped ~640px.
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
 *
 * Nav lives in `features/navigation/` — both `Sidebar` (md+) and `BottomNav`
 * (<md) render from the same NAV_ITEMS registry.
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
  // Mount the realtime nudge hook ONCE for the whole gated session — it owns
  // the WS connection, toasts on coach replies, and invalidates the unread
  // count. Mounting per-route would tear/restart the socket on every nav.
  useNotificationsRealtime()

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />

      {/*
       * Content column. `md:pl-60` on the outer main reserves space for the
       * fixed sidebar; the inner div handles the centered, capped reading
       * column. `pb-24` keeps the mobile bottom-nav from covering the last
       * row (78px nav + breathing room; the iPhone home indicator is handled
       * by env(safe-area-inset-bottom) inside BottomNav itself).
       */}
      <main className="pb-24 md:pb-10 md:pl-60">
        <div className="mx-auto w-full max-w-[640px] px-5 py-6">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
