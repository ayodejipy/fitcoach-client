import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas/login'
import { useLogin } from '@/features/auth/hooks/useLogin'

/*
 * LoginForm — pure UI.
 *
 * No async logic in here. `useLogin` owns the mutation, token hydration,
 * navigation, and inline-vs-toast error split. This component just wires
 * RHF + Zod → render fields → on submit, hand values + the inline-error
 * callback to the hook.
 *
 * Pattern lives in MEMORY.md / feedback_async_in_hooks: components are pure
 * UI; async lives in `features/<domain>/hooks/use<Action>.ts`.
 */
export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  })

  const { login, isPending } = useLogin()

  const onSubmit = (values: LoginFormValues) =>
    login(values, {
      // Pin backend "wrong email or password" to the password field —
      // we can't disambiguate which input was wrong, so the password is
      // the conventional landing spot.
      onInlineError: (message) =>
        form.setError('password', { type: 'server', message }),
    })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
        noValidate
      >
        <h1 className="text-[20px] font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-1 mb-6 text-[13.5px] text-muted-foreground">
          Sign in to check in with your coach.
        </p>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  placeholder="you@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="mt-6 w-full"
          disabled={isPending}
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Form>
  )
}
