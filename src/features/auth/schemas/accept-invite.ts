import { z } from 'zod'

/*
 * Accept-invite form schema.
 *
 * Backend's AcceptPortalInviteRequest is `{ token, password }` only —
 * the token comes from the URL search param (?token=...). We still collect
 * email + confirm-password from the user because:
 *   - email is needed for the immediate follow-up login call (the backend
 *     returns 204 No Content from accept-invite — no tokens — so we chain
 *     into the login endpoint with the same password the user just set).
 *   - confirm-password is a UX guard against typos when setting a password
 *     for the first time.
 *
 * Decision 6A (cold-start): the form's copy + flow is friendly, coach-named
 * if the invite payload has a name (deferred — needs a /portal/invite-info
 * endpoint that doesn't exist yet, so v1 renders generic warmth).
 *
 * Password rules: the backend enforces them. Client adds a tiny "8+ chars"
 * floor so the user doesn't submit "abc" and get a backend rejection — pure
 * UX, no security claim.
 */
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
