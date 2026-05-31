import { ZodError } from 'zod'

import { AppError } from '@/lib/api/error'

/*
 * humanizeUploadError — convert anything thrown by `useUploadPhoto` into a
 * one-line user-readable string.
 *
 * Three throw sources, in order:
 *   1. ZodError from `photoFileSchema.parse(file)` — pre-flight validation.
 *      The issue messages are already user-ready ("Only JPEG, PNG, or WEBP.")
 *   2. AppError normalized by `appErrorFromThrown` — backend error message
 *      (e.g. "file exceeds 4 MB limit").
 *   3. Anything else — fallback to a generic retry prompt.
 *
 * Lives in `utils/` (not inline in PhotoUpload) so the same humanizer can
 * be reused if a future surface (e.g. an avatar uploader) needs it.
 */
export function humanizeUploadError(err: unknown): string {
  if (err instanceof ZodError) {
    return err.issues[0]?.message ?? "That photo couldn't be used."
  }
  if (err instanceof AppError) {
    return err.message
  }
  return 'Upload failed. Try again.'
}
