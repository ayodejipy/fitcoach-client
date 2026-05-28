import { Outlet, createFileRoute } from '@tanstack/react-router'

/*
 * `_app` layout — wraps every gated (authenticated) page.
 *
 * v1 responsive pattern (Decision 9D):
 *   - mobile (<768px): content single-column, bottom nav fixed.
 *   - desktop (>=768px): left sidebar nav, content column capped ~640px.
 *
 * Auth gate hook (TODO Task T4): the `beforeLoad` here will check the
 * tokens slice in Zustand and `throw redirect({ to: '/login' })` if the
 * client isn't authenticated. Currently a no-op so the empty shell renders.
 */
export const Route = createFileRoute('/_app')({
  component: AppLayout,
  // beforeLoad: ({ context }) => {
  //   if (!context.auth?.isAuthenticated) {
  //     throw redirect({ to: '/login' })
  //   }
  // },
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
