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
        noValidate
        className="w-full max-w-[380px]"
      >
        <header className="mb-8">
          <h1
            className="font-display text-[32px] leading-[1.1] tracking-[-0.01em] text-foreground"
            style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 40" }}
          >
            Welcome back.
          </h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Sign in to check in with your coach.
          </p>
        </header>

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

        <p className="mt-7 text-center text-[13px] text-muted-foreground">
          New to FitCoach?{' '}
          <a
            href="#"
            className="font-semibold text-[color:var(--green-brand)] hover:underline"
          >
            Talk to your coach →
          </a>
        </p>
      </form>
    </Form>
  )
}
