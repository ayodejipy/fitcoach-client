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
  acceptInviteSchema,
  type AcceptInviteFormValues,
} from '@/features/auth/schemas/accept-invite'
import { useAcceptInvite } from '@/features/auth/hooks/useAcceptInvite'

interface Props {
  token: string
}

export function AcceptInviteForm({ token }: Props) {
  const form = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
    mode: 'onSubmit',
  })

  const { accept, isPending } = useAcceptInvite(token)

  const onSubmit = (values: AcceptInviteFormValues) =>
    accept(values, {
      // Token errors (invalid / already-used) surface at the password field —
      // it's the input the user is most attached to in this flow.
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
          Set your password
        </h1>
        <p className="mt-1 mb-6 text-[13.5px] text-muted-foreground">
          You'll check in each Sunday and your coach will reply within a day.
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
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4">
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter to confirm"
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
          {isPending ? 'Setting up…' : 'Set password & continue'}
        </Button>
      </form>
    </Form>
  )
}
