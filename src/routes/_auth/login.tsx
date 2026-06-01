import { createFileRoute } from '@tanstack/react-router'

import { HeroSplit } from '@/components/layout/HeroSplit'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { LoginHeroPanel } from '@/features/auth/components/LoginHeroPanel'

/*
 * `/login` — public login page.
 *
 * Post-redesign: full-viewport HeroSplit. Left (65%) holds the brand-storytelling
 * panel with hero photograph + Fraunces editorial copy. Right (35%) holds the
 * sign-in form on a cream surface. Mobile (<lg) stacks the hero photo crop
 * on top + form below.
 *
 * The `redirect` search param is set by the `_app` route's beforeLoad gate
 * when an unauthenticated user tries to reach a gated route. After successful
 * login `useLogin` sends them there instead of the default /dashboard.
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
  return (
    <HeroSplit
      brand={<LoginHeroPanel />}
      form={<LoginForm />}
      bodyBackground="var(--cream, #FAF7F0)"
    />
  )
}
