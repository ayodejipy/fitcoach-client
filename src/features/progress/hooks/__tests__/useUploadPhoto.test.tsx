import { http, HttpResponse } from 'msw'
import { ZodError } from 'zod'
import { renderHook } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import { AppError } from '@/lib/api/error'
import { useUploadPhoto } from '@/features/progress/hooks/useUploadPhoto'
import { MAX_PHOTO_BYTES } from '@/features/progress/schemas/photo-upload'

import { server, TEST_BASE_URL } from '@/test/msw/server'
import {
  createTestQueryClient,
  withQueryClient,
} from '@/test/react-helpers'
import { configureTestClient } from '@/test/test-client'

/*
 * useUploadPhoto.test — validates the upload flow end-to-end:
 *   1. Pre-flight schema validation rejects bad files BEFORE the network.
 *   2. Happy path returns the URL.
 *   3. Backend rename (`{ photo_url }` instead of `{ url }`) falls back to
 *      the first string value — guards against schema drift on the server.
 *   4. Backend 400/503 errors normalize to AppError carrying backend copy.
 *
 * MSW intercepts the multipart POST. We don't assert on the request body
 * shape here — that's a contract test for the SDK, not the hook.
 */

const UPLOAD_URL = `${TEST_BASE_URL}/api/v1/portal/uploads/photo`

function jpeg(bytes: number, name = 'photo.jpg'): File {
  return new File([new Uint8Array(bytes)], name, { type: 'image/jpeg' })
}

function renderUseUploadPhoto() {
  const queryClient = createTestQueryClient()
  return renderHook(() => useUploadPhoto(), {
    wrapper: withQueryClient(queryClient),
  })
}

describe('useUploadPhoto', () => {
  beforeAll(() => {
    configureTestClient()
  })

  describe('pre-flight validation', () => {
    it('rejects an oversize file with ZodError before any network call', async () => {
      let networkHit = false
      server.use(
        http.post(UPLOAD_URL, () => {
          networkHit = true
          return HttpResponse.json({ url: 'should-not-be-returned' })
        }),
      )

      const { result } = renderUseUploadPhoto()
      const big = jpeg(MAX_PHOTO_BYTES + 1)

      await expect(result.current.upload(big)).rejects.toBeInstanceOf(ZodError)
      expect(networkHit).toBe(false)
    })

    it('rejects an unsupported MIME with ZodError before network', async () => {
      let networkHit = false
      server.use(
        http.post(UPLOAD_URL, () => {
          networkHit = true
          return HttpResponse.json({ url: 'x' })
        }),
      )

      const { result } = renderUseUploadPhoto()
      const gif = new File([new Uint8Array(1024)], 'a.gif', {
        type: 'image/gif',
      })

      await expect(result.current.upload(gif)).rejects.toBeInstanceOf(ZodError)
      expect(networkHit).toBe(false)
    })
  })

  describe('successful upload', () => {
    it('resolves with the URL from the `url` field', async () => {
      const { result } = renderUseUploadPhoto()
      const file = jpeg(1024)

      const res = await result.current.upload(file)
      expect(res.url).toBe(
        'https://cdn.example.com/fitcoach/progress-photos/abc.jpg',
      )
    })

    it('falls back to the first string value if the backend renames `url`', async () => {
      // If a future backend version returns { photo_url } instead, the hook
      // should still find the URL — defensive coding for schema drift.
      server.use(
        http.post(UPLOAD_URL, () =>
          HttpResponse.json({ photo_url: 'https://cdn/renamed.jpg' }),
        ),
      )

      const { result } = renderUseUploadPhoto()
      const res = await result.current.upload(jpeg(1024))
      expect(res.url).toBe('https://cdn/renamed.jpg')
    })

    it('throws an AppError if the response has no string values at all', async () => {
      server.use(
        http.post(UPLOAD_URL, () => HttpResponse.json({ unrelated: 42 })),
      )

      const { result } = renderUseUploadPhoto()
      await expect(result.current.upload(jpeg(1024))).rejects.toBeInstanceOf(
        AppError,
      )
    })
  })

  describe('backend errors normalize to AppError', () => {
    it('400 with backend copy → AppError carrying the message', async () => {
      server.use(
        http.post(UPLOAD_URL, () =>
          HttpResponse.json(
            { code: 'INVALID_FILE_TYPE', error: 'only JPEG, PNG, and WEBP images are accepted' },
            { status: 400 },
          ),
        ),
      )

      const { result } = renderUseUploadPhoto()
      try {
        await result.current.upload(jpeg(1024))
        throw new Error('expected upload to throw')
      } catch (e) {
        expect(e).toBeInstanceOf(AppError)
        const err = e as AppError
        expect(err.status).toBe(400)
        expect(err.code).toBe('INVALID_FILE_TYPE')
        expect(err.message).toBe(
          'only JPEG, PNG, and WEBP images are accepted',
        )
      }
    })

    it('503 with backend copy → AppError carrying the message', async () => {
      server.use(
        http.post(UPLOAD_URL, () =>
          HttpResponse.json(
            { code: 'STORAGE_NOT_CONFIGURED', error: 'file storage is not configured' },
            { status: 503 },
          ),
        ),
      )

      const { result } = renderUseUploadPhoto()
      try {
        await result.current.upload(jpeg(1024))
        throw new Error('expected upload to throw')
      } catch (e) {
        const err = e as AppError
        expect(err.status).toBe(503)
        expect(err.message).toBe('file storage is not configured')
      }
    })
  })
})
