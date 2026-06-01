import type { PhotoEntry } from '@/features/progress/hooks/useProgressData'

/*
 * PhotoTimeline — horizontal scroll-snap carousel of progress photos.
 *
 * Native CSS scroll-snap-x covers what we need on mobile (swipe = scroll =
 * snap to next photo) and on desktop (trackpad swipe / arrow keys / scrollbar).
 * No library, no JS gesture tracking — the platform already does it.
 *
 * Photo size: 220px square thumbnails on mobile (fits ~1.5 on a 360px
 * viewport so the user always sees an edge of the next photo, signaling
 * "swipe for more"). Desktop bumps to 320px — the progress page is the
 * "show your transformation" surface and the bigger thumbnails carry more
 * weight against the chart cards below.
 *
 * Lazy-loading images keeps the scroll smooth and the initial paint cheap —
 * an active client could have 50+ photos at year's end.
 *
 * Empty state lives outside this component: callers decide whether to render
 * `<PhotoTimeline />` or an empty-state card. Keeps this component focused.
 */
interface Props {
  photos: PhotoEntry[]
}

export function PhotoTimeline({ photos }: Props) {
  if (photos.length === 0) return null

  return (
    <div
      role="region"
      aria-label="Progress photo timeline"
      className="-mx-5 overflow-x-auto lg:-mx-10"
      style={{
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <ul className="flex gap-3 px-5 pb-1 lg:gap-4 lg:px-10">
        {photos.map((photo, index) => (
          <li
            key={`${photo.url}-${index}`}
            className="shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <figure className="flex flex-col gap-2">
              <div className="overflow-hidden rounded-[16px] border border-border bg-[color:var(--bg-surface-muted)]">
                <img
                  src={photo.url}
                  alt={`Progress photo from week of ${photo.weekStartDate}`}
                  loading="lazy"
                  decoding="async"
                  className="block h-[220px] w-[220px] object-cover lg:h-[320px] lg:w-[320px]"
                />
              </div>
              <figcaption className="text-[12.5px] font-semibold text-[color:var(--text-secondary)]">
                {photo.label}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  )
}
