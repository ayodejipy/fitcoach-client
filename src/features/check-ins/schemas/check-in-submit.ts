import { z } from 'zod'

/*
 * Check-in submission schema.
 *
 * Mirrors the backend's `handlers.CreateCheckInRequest` shape with v1 form
 * UX rules layered on top. Only `week_start_date` is required by the backend
 * — the form supplies it automatically from "this week's Monday" via the
 * `useStreak` hook (the user never types this). All other fields are
 * optional from the backend's perspective; the form requires a few of them
 * to make the check-in meaningful:
 *
 *   - weight_lbs: required in the form (the headline metric coaches react to).
 *   - energy_score / mood_score: required, 1-10 (sliders).
 *   - sleep_hrs: optional, 0-24.
 *   - notes: optional, max 10000 chars (the backend cap).
 *
 * Photos (photo_urls, max 4) are deferred to T9 (progress timeline) when
 * the upload UX lands. The submit body just omits them in v1.
 *
 * Client validation is intentionally minimal — the backend is the ground
 * truth on ranges. We only catch typos the user would obviously not want
 * to send (e.g., 0 sleep, negative weight).
 */

export const checkInSubmitSchema = z.object({
  week_start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Internal: missing week start date.'),
  weight_lbs: z
    .number({ message: 'How much do you weigh this week?' })
    .positive('Weight has to be positive.')
    .max(2000, 'That weight looks like a typo.'),
  energy_score: z
    .number({ message: 'Rate your energy 1–10.' })
    .int('Pick a whole number.')
    .min(1, 'At least 1.')
    .max(10, 'At most 10.'),
  mood_score: z
    .number({ message: 'Rate your mood 1–10.' })
    .int('Pick a whole number.')
    .min(1, 'At least 1.')
    .max(10, 'At most 10.'),
  sleep_hrs: z
    .number()
    .min(0, "Sleep can't be negative.")
    .max(24, 'More than 24 hours? Lucky you.')
    .optional(),
  notes: z
    .string()
    .max(10_000, 'Notes are capped at 10,000 characters.')
    .optional(),
})

export type CheckInSubmitFormValues = z.infer<typeof checkInSubmitSchema>
