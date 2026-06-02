import { createFileRoute } from '@tanstack/react-router'

import { HeroSplit } from '@/components/layout/HeroSplit'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { LoginHeroPanel } from '@/features/auth/components/LoginHeroPanel'

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
