import { createFileRoute } from '@tanstack/react-router'

import { LoginForm } from '@/features/auth/components/LoginForm'

/*
 * `/login` — public login page.
 *
 * The `redirect` search param is set by the `_app` route's beforeLoad gate
 * when an unauthenticated user tries to reach a gated route. After successful
 * login we send them there instead of the default /dashboard.
 *
 * `validateSearch` is the canonical TanStack Router way to declare a typed
 * search-param contract for the route. It also rejects unexpected params at
 * the router boundary (good hygiene).
 */
export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => {
    // Output the key only when present so the route's search type is
    // `{ redirect?: string }` (truly optional) rather than `{ redirect: string | undefined }`
    // (key always present). This keeps `<Link to="/login">` callers from having
    // to pass `search={{}}` everywhere.
    const out: { redirect?: string } = {}
    if (typeof search.redirect === 'string') out.redirect = search.redirect
    return out
  },
})

function LoginPage() {
  return <LoginForm />
}
