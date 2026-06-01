import { Outlet, createFileRoute } from '@tanstack/react-router'

/*
 * `_auth` layout — wraps the public auth pages (login, accept-invite).
 *
 * Thin pass-through after the May 2026 redesign. Each auth route owns its
 * own layout:
 *   - /login → renders `<HeroSplit>` (full viewport split-screen)
 *   - /accept-invite → renders its own centered wordmark + form shell
 *
 * Why no shared shell anymore: the locked Login direction (Variant A,
 * photographic editorial 65/35) needs full viewport control to render
 * the hero photograph + cream form column. A shared centered wrapper
 * would break it.
 */
export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="min-h-dvh bg-background">
      <Outlet />
    </div>
  )
}
