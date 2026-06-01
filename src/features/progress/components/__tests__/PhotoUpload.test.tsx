import { useState } from 'react'
import { http, HttpResponse } from 'msw'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { PhotoUpload } from '@/features/progress/components/PhotoUpload'
import { MAX_PHOTO_BYTES } from '@/features/progress/schemas/photo-upload'

import { server, TEST_BASE_URL } from '@/test/msw/server'
import {
  createTestQueryClient,
  withQueryClient,
} from '@/test/react-helpers'
import { configureTestClient } from '@/test/test-client'

/*
 * PhotoUpload.test — UI smoke of the controlled photo-upload field.
 *
 * Covered:
 *   - Renders the "Add photo" button when value is empty.
 *   - Picking a valid file uploads + appends URL to value (parent state).
 *   - Picking an invalid file (wrong MIME / too large) shows inline error
 *     and does NOT extend the value.
 *   - Backend failure (5xx) shows inline error.
 *   - Tapping the X removes a thumbnail.
 *   - At capacity (4 photos), the Add-photo button is hidden and the helper
 *     text switches to the cap message.
 *
 * Tests use a tiny `<Harness>` wrapper that exposes the controlled value via
 * a useState hook so we can assert on what RHF would see.
 */

const UPLOAD_URL = `${TEST_BASE_URL}/api/v1/portal/uploads/photo`

function jpegFile(name: string, bytes = 1024): File {
  return new File([new Uint8Array(bytes)], name, { type: 'image/jpeg' })
}

interface HarnessProps {
  initial?: string[]
  onChangeSpy?: (urls: string[]) => void
}

function Harness({ initial = [], onChangeSpy }: HarnessProps) {
  const [photoUrls, setPhotoUrls] = useState<string[]>(initial)
  return (
    <PhotoUpload
      value={photoUrls}
      onChange={(nextUrls) => {
        setPhotoUrls(nextUrls)
        onChangeSpy?.(nextUrls)
      }}
    />
  )
}

function renderHarness(props?: HarnessProps) {
  const queryClient = createTestQueryClient()
  return render(<Harness {...props} />, {
    wrapper: withQueryClient(queryClient),
  })
}

describe('<PhotoUpload />', () => {
  beforeAll(() => {
    configureTestClient()
  })

  it('renders the Add photo button and the helper hint when empty', () => {
    renderHarness()
    expect(
      screen.getByRole('button', { name: /add photo/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/up to 4 photos.*jpeg.*png.*webp.*4 mb/i),
    ).toBeInTheDocument()
  })

  it('uploads a valid file and appends the returned URL to value', async () => {
    const onChangeSpy = vi.fn()
    const user = userEvent.setup()
    renderHarness({ onChangeSpy })

    const file = jpegFile('progress.jpg')
    const fileInput = document.querySelector<HTMLInputElement>(
      'input[type="file"]',
    )!
    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(onChangeSpy).toHaveBeenCalledWith([
        'https://cdn.example.com/fitcoach/progress-photos/abc.jpg',
      ])
    })

    // Thumbnail rendered for the uploaded URL.
    expect(
      screen.getByAltText(/progress photo 1/i),
    ).toBeInTheDocument()
  })

  it('shows inline error for an oversize file (pre-flight reject, no upload)', async () => {
    let networkHit = false
    server.use(
      http.post(UPLOAD_URL, () => {
        networkHit = true
        return HttpResponse.json({ url: 'should-not-fire' })
      }),
    )

    const onChangeSpy = vi.fn()
    const user = userEvent.setup()
    renderHarness({ onChangeSpy })

    const tooBig = jpegFile('big.jpg', MAX_PHOTO_BYTES + 1)
    const fileInput = document.querySelector<HTMLInputElement>(
      'input[type="file"]',
    )!
    await user.upload(fileInput, tooBig)

    await waitFor(() => {
      expect(
        screen.getByText(/photos must be 4 mb or smaller/i),
      ).toBeInTheDocument()
    })
    expect(networkHit).toBe(false)
    expect(onChangeSpy).not.toHaveBeenCalled()
  })

  it('shows inline error for an unsupported MIME (pre-flight reject)', async () => {
    const onChangeSpy = vi.fn()
    const user = userEvent.setup()
    renderHarness({ onChangeSpy })

    const gif = new File([new Uint8Array(1024)], 'a.gif', { type: 'image/gif' })
    const fileInput = document.querySelector<HTMLInputElement>(
      'input[type="file"]',
    )!
    await user.upload(fileInput, gif)

    await waitFor(() => {
      expect(screen.getByText(/JPEG|PNG|WEBP/i)).toBeInTheDocument()
    })
    expect(onChangeSpy).not.toHaveBeenCalled()
  })

  it('shows inline error when the backend returns 503', async () => {
    server.use(
      http.post(UPLOAD_URL, () =>
        HttpResponse.json(
          {
            code: 'STORAGE_NOT_CONFIGURED',
            error: 'file storage is not configured',
          },
          { status: 503 },
        ),
      ),
    )

    const onChangeSpy = vi.fn()
    const user = userEvent.setup()
    renderHarness({ onChangeSpy })

    const fileInput = document.querySelector<HTMLInputElement>(
      'input[type="file"]',
    )!
    await user.upload(fileInput, jpegFile('a.jpg'))

    await waitFor(() => {
      expect(
        screen.getByText(/file storage is not configured/i),
      ).toBeInTheDocument()
    })
    expect(onChangeSpy).not.toHaveBeenCalled()
  })

  it('removes a thumbnail when its X button is clicked', async () => {
    const onChangeSpy = vi.fn()
    const user = userEvent.setup()
    renderHarness({
      initial: ['https://cdn/one.jpg', 'https://cdn/two.jpg'],
      onChangeSpy,
    })

    expect(screen.getAllByAltText(/progress photo/i)).toHaveLength(2)

    await user.click(
      screen.getByRole('button', { name: /remove photo 1/i }),
    )

    await waitFor(() => {
      expect(onChangeSpy).toHaveBeenCalledWith(['https://cdn/two.jpg'])
    })
  })

  it('hides Add photo + shows cap message at 4 photos', () => {
    renderHarness({
      initial: [
        'https://cdn/1.jpg',
        'https://cdn/2.jpg',
        'https://cdn/3.jpg',
        'https://cdn/4.jpg',
      ],
    })

    expect(
      screen.queryByRole('button', { name: /add photo/i }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/max 4 photos/i)).toBeInTheDocument()
  })
})
