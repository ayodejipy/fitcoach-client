import { describe, expect, it } from 'vitest'

import {
  ALLOWED_PHOTO_MIME_TYPES,
  MAX_PHOTO_BYTES,
  photoFileSchema,
} from '@/features/progress/schemas/photo-upload'

/*
 * photo-upload.test — guards the pre-flight validation that fires BEFORE
 * we burn bandwidth on a doomed multipart POST.
 *
 * The schema mirrors `internal/handlers/uploads.go` exactly. If the backend
 * tightens or loosens its accept rules, this test set drifts and the
 * mirror needs updating — that's a feature, not a bug.
 *
 * `fakeFile` builds a File with controllable size + type without actually
 * allocating real image bytes — Blob with a sized payload string.
 */

function fakeFile(opts: {
  bytes: number
  type: string
  name?: string
}): File {
  // Use a Uint8Array of the requested size so File.size is exact.
  const buf = new Uint8Array(opts.bytes)
  return new File([buf], opts.name ?? 'photo.jpg', { type: opts.type })
}

describe('photoFileSchema', () => {
  describe('happy paths', () => {
    it.each(ALLOWED_PHOTO_MIME_TYPES.map((t) => [t]))(
      'accepts a 1 KB %s file',
      (mime) => {
        const f = fakeFile({ bytes: 1024, type: mime })
        const parsed = photoFileSchema.parse(f)
        expect(parsed).toBe(f)
      },
    )

    it('accepts a file exactly at the 4 MB limit', () => {
      const f = fakeFile({ bytes: MAX_PHOTO_BYTES, type: 'image/jpeg' })
      expect(() => photoFileSchema.parse(f)).not.toThrow()
    })
  })

  describe('rejections', () => {
    it('rejects a file ONE byte over the 4 MB limit', () => {
      const f = fakeFile({ bytes: MAX_PHOTO_BYTES + 1, type: 'image/jpeg' })
      const result = photoFileSchema.safeParse(f)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toMatch(/4 MB/)
    })

    it('rejects an empty (0-byte) file', () => {
      const f = fakeFile({ bytes: 0, type: 'image/jpeg' })
      const result = photoFileSchema.safeParse(f)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toMatch(/empty/i)
    })

    it.each([
      ['image/gif'],
      ['image/svg+xml'],
      ['application/pdf'],
      ['text/plain'],
      [''],
    ])('rejects MIME type %s', (mime) => {
      const f = fakeFile({ bytes: 1024, type: mime })
      const result = photoFileSchema.safeParse(f)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toMatch(/JPEG|PNG|WEBP/)
    })

    it('rejects a non-File input (e.g. plain object)', () => {
      const fake = { size: 100, type: 'image/jpeg' }
      const result = photoFileSchema.safeParse(fake)
      expect(result.success).toBe(false)
    })

    it('rejects a Blob that is not a File', () => {
      const blob = new Blob([new Uint8Array(10)], { type: 'image/jpeg' })
      const result = photoFileSchema.safeParse(blob)
      expect(result.success).toBe(false)
    })

    it('rejects null / undefined', () => {
      expect(photoFileSchema.safeParse(null).success).toBe(false)
      expect(photoFileSchema.safeParse(undefined).success).toBe(false)
    })
  })

  describe('ordering of issues', () => {
    it('reports size error before MIME error for an oversize bad-MIME file', () => {
      // Whichever issue comes first shapes the user-facing message via the
      // first .refine() that runs. The schema chains size BEFORE mime, so an
      // 8 MB GIF should fail on size.
      const f = fakeFile({ bytes: MAX_PHOTO_BYTES * 2, type: 'image/gif' })
      const result = photoFileSchema.safeParse(f)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toMatch(/4 MB/)
    })
  })
})
