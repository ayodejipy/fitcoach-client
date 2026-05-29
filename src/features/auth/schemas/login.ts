import { z } from 'zod'

/*
 * Login form schema.
 *
 * Mirrors the backend's PortalLoginRequest shape (email + password). Client
 * validation here is intentionally minimal — the backend is the ground truth.
 * We only validate things that would be obviously wrong before round-tripping:
 *   - email looks like an email (catch typos before a 400)
 *   - password is at least 1 char (no empty submit)
 *
 * The backend enforces real password rules; we don't re-encode them here so
 * the two sources never drift.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('That doesn\'t look like an email.'),
  password: z.string().min(1, 'Password is required.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
