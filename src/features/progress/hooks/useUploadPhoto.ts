import { useMutation } from '@tanstack/react-query'

import { portalUploadPhotoMutation } from '@/lib/api/generated/@tanstack/react-query.gen'
import { appErrorFromThrown } from '@/lib/api/error'
import {
  photoFileSchema,
  type PhotoFile,
} from '@/features/progress/schemas/photo-upload'

/*
 * useUploadPhoto — uploads a single progress photo and resolves with the URL.
 *
 * Flow:
 *   1. Caller (PhotoUpload field) hands us a File.
 *   2. We validate against `photoFileSchema` for an early reject on bad
 *      size/type — saves a wasted upload.
 *   3. Multipart POST → /api/v1/portal/uploads/photo → backend returns
 *      `{ url: "https://..." }`.
 *   4. Resolve the URL back to the caller, which stuffs it into the
 *      check-in form's `photo_urls` array. Submit happens later.
 *
 * The upload is fire-and-resolve, not a global mutation cache entry — we don't
 * want a list of "uploaded photos" hanging around in state, just the URL for
 * the form to keep. So this hook exposes a `upload(file)` function and
 * `isPending` rather than the raw mutation object.
 *
 * `meta.skipToast` — the photo-upload field shows inline progress + errors;
 * the global toaster sits this one out. Consistent with the rest of our
 * mutation pattern (login, check-in submit also opt out).
 */

export interface UploadResult {
  url: string
}

export function useUploadPhoto() {
  const mutation = useMutation({
    ...portalUploadPhotoMutation(),
    meta: { skipToast: true },
  })

  async function upload(file: File): Promise<UploadResult> {
    // Early validation. Throws ZodError if the file is rejected; caller catches.
    const validated: PhotoFile = photoFileSchema.parse(file)

    try {
      const data = await mutation.mutateAsync({
        body: { photo: validated },
      })
      // Backend response is `{ [key: string]: string }` — the handler returns
      // `{"url": "..."}`. Accept either `url` or the first string value as a
      // defensive fallback (cheap insurance against a backend rename).
      const url =
        typeof data?.url === 'string'
          ? data.url
          : Object.values(data ?? {}).find((v): v is string => typeof v === 'string')
      if (!url) {
        throw new Error("Upload succeeded but no URL came back.")
      }
      return { url }
    } catch (e) {
      // Normalize AppError-shaped throws so the caller has one shape to
      // handle. Validation errors (ZodError) are NOT normalized — they
      // carry useful path info the form can map to a field message.
      throw appErrorFromThrown(e)
    }
  }

  return {
    upload,
    isPending: mutation.isPending,
  }
}
