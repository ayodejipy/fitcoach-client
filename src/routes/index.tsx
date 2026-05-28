import { createFileRoute, redirect } from '@tanstack/react-router'

/*
 * `/` — root index. Currently redirects to the dashboard (gated route).
 *
 * Once Task T4 (auth spine) lands, this redirect will become a smart router:
 * authenticated → /dashboard, unauthenticated → /login. For now the `_app`
 * layout's beforeLoad gate handles the redirect-to-login on its own.
 */
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' })
  },
})
