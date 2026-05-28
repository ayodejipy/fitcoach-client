import { Outlet, createFileRoute } from '@tanstack/react-router'

/*
 * `_auth` layout — wraps all public pages (login, accept-invite).
 *
 * Centered single-column layout, mobile-first, branded greeting card.
 * Width caps at the mobile design (Decision 9D — same column width
 * across viewports for these auth pages; sidebar lives only behind the
 * `_app` gate).
 */
export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-[420px]">
        <header className="mb-8 text-center">
          <div className="text-[22px] font-extrabold tracking-tight text-foreground">
            FitCoach
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Your weekly check-in, with your coach.
          </p>
        </header>
        <Outlet />
      </div>
    </div>
  )
}
