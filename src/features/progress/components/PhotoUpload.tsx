import { useId, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useUploadPhoto } from '@/features/progress/hooks/useUploadPhoto'
import { MAX_PHOTO_BYTES } from '@/features/progress/schemas/photo-upload'
import { humanizeUploadError } from '@/features/progress/utils/humanize-upload-error'

/*
 * PhotoUpload — controlled field for the check-in form's progress photos.
 *
 * Value is the array of uploaded photo URLs. Each pick triggers an upload;
 * on success the URL is appended; on failure an inline error appears. The
 * caller (RHF in CheckInForm) reads the array, sends it as `photo_urls`
 * at submit time.
 *
 * Backend caps at 4 photos per check-in (uploads.go MaxPhotosPerCheckIn).
 * We enforce that on the front end too so the button disables once full.
 *
 * The component handles its own upload state (isPending, inlineError) —
 * `useUploadPhoto` is the source of truth for the network side, this owns
 * the UI side. RHF doesn't see the upload mid-flight, only the final URLs.
 */

const MAX_PHOTOS = 4
const MAX_MB = Math.round(MAX_PHOTO_BYTES / 1024 / 1024)

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
}

export function PhotoUpload({ value, onChange }: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { upload, isPending } = useUploadPhoto()
  const [inlineError, setInlineError] = useState<string | null>(null)

  const atCapacity = value.length >= MAX_PHOTOS

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Always reset the input so picking the same file twice in a row fires
    // a fresh change event.
    e.target.value = ''
    if (!file) return

    setInlineError(null)

    try {
      const { url } = await upload(file)
      onChange([...value, url])
    } catch (err) {
      setInlineError(humanizeUploadError(err))
    }
  }

  function handleRemove(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
    setInlineError(null)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {value.map((url, idx) => (
          <div
            key={`${url}-${idx}`}
            className="relative h-20 w-20 overflow-hidden rounded-[10px] border border-border bg-[color:var(--bg-surface-muted)]"
          >
            <img
              src={url}
              alt={`Progress photo ${idx + 1}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label={`Remove photo ${idx + 1}`}
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>
        ))}

        {!atCapacity && (
          <>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="sr-only"
              disabled={isPending}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
              className="h-20 w-20 flex-col gap-1 text-[11px] font-semibold text-[color:var(--text-secondary)]"
              aria-controls={inputId}
            >
              <ImagePlus className="h-5 w-5" strokeWidth={1.8} />
              {isPending ? 'Uploading…' : 'Add photo'}
            </Button>
          </>
        )}
      </div>

      <p className="mt-2 text-[12px] text-[color:var(--text-muted)]">
        {atCapacity
          ? `Max ${MAX_PHOTOS} photos per check-in.`
          : `Optional. Up to ${MAX_PHOTOS} photos · JPEG, PNG, or WEBP · ${MAX_MB} MB each.`}
      </p>

      {inlineError && (
        <p className="mt-1 text-[12px] font-semibold text-[color:var(--red)]">
          {inlineError}
        </p>
      )}
    </div>
  )
}
