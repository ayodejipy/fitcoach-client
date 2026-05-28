import { createFileRoute } from '@tanstack/react-router'

/*
 * `/login` — public login form (placeholder shell).
 *
 * Real implementation lands with Task T4 (auth spine): RHF + Zod form
 * against the generated `@hey-api` portal-login client, single-flight
 * refresh-on-401 interceptor wired (Decision 5A).
 */
export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <h1 className="text-[20px] font-bold tracking-tight text-foreground">
        Welcome back
      </h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">
        Sign in to check in with your coach.
      </p>
      <p className="mt-6 rounded-md bg-muted px-3 py-2 text-[12.5px] text-muted-foreground">
        Login form coming in Task T4 (auth spine).
      </p>
    </div>
  )
}
