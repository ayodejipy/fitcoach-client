import { z } from 'zod'

/*
 * photoFileSchema — client-side guard before we send the upload.
 *
 * Mirrors the backend's accept rules (uploads.go):
 *   - JPEG, PNG, or WEBP
 *   - 4 MB max
 *
 * Why validate here when the backend re-validates anyway: catching it before
 * the multipart POST saves the user a round-trip + the wait (a 4 MB upload
 * over a cellular connection isn't free). The backend's authority is intact;
 * this is just a friendly early reject.
 */

export const MAX_PHOTO_BYTES = 4 * 1024 * 1024 // 4 MB

export const ALLOWED_PHOTO_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const photoFileSchema = z
  .instanceof(File, { message: 'Pick a photo to upload.' })
  .refine((f) => f.size > 0, 'That file looks empty.')
  .refine(
    (f) => f.size <= MAX_PHOTO_BYTES,
    `Photos must be 4 MB or smaller.`,
  )
  .refine(
    (f) =>
      ALLOWED_PHOTO_MIME_TYPES.includes(
        f.type as (typeof ALLOWED_PHOTO_MIME_TYPES)[number],
      ),
    'Only JPEG, PNG, or WEBP images.',
  )

export type PhotoFile = z.infer<typeof photoFileSchema>
