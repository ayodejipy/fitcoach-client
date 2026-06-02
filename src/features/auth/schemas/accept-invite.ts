import { z } from 'zod'

export const acceptInviteSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required.')
      .email('That doesn\'t look like an email.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please re-enter your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords don\'t match.',
    path: ['confirmPassword'],
  })

export type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>
