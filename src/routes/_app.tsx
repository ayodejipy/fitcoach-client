import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { BottomNav } from '@/features/navigation/components/BottomNav'
import { Sidebar } from '@/features/navigation/components/Sidebar'
import { useNotificationsRealtime } from '@/features/notifications/hooks/useNotificationsRealtime'
import { MobileProfileMenu } from '@/features/profile/components/MobileProfileMenu'
import { useTokensStore } from '@/stores/tokens'

/*
 * `_app` layout — wraps every gated (authenticated) page.
 *
 * Responsive pattern (post-redesign):
 *   - mobile + tablet (<lg, i.e. <1024px): single column, bottom nav fixed.
 *   - desktop (lg+): left sidebar nav, content max-width per route via PageShell.
 *
 * Why lg (not md) as the desktop breakpoint: at md (768px) the 65/35 login
 * split-screen squeezes form inputs below ~190px, and the dashboard 2-col grid
 * cards become uncomfortably narrow. iPad portrait now gets the mobile
 * layout, which is the better fit for that form factor.
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
 * Max-width per route: each route component wraps its content in
 * `<PageShell size="...">` to pick its own max-width (narrow 720 / medium
 * 1040 / wide 1120). _app.tsx no longer applies a global max-width.
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
       * Content column. `lg:pl-60` reserves space for the fixed sidebar at
       * desktop. `pb-24` keeps the mobile bottom-nav from covering the last
       * row (78px nav + breathing room; the iPhone home indicator is handled
       * by env(safe-area-inset-bottom) inside BottomNav itself).
       *
       * Per-route max-width comes from each route's `<PageShell>` wrapper.
       */}
      <main className="pb-24 lg:pb-10 lg:pl-60">
        <Outlet />
      </main>

      <BottomNav />
      <MobileProfileMenu />
    </div>
  )
}
