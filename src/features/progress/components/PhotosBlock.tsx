import { Camera } from 'lucide-react'

import { EmptyState } from '@/features/progress/components/EmptyState'
import { PhotoTimeline } from '@/features/progress/components/PhotoTimeline'
import type { PhotoEntry } from '@/features/progress/hooks/useProgressData'

/*
 * PhotosBlock — the photos section on the /progress page.
 *
 * Wraps the timeline (or its empty state) with a section heading so the
 * page IA stays consistent whether the user has photos yet or not.
 *
 * Reasoning lives here (which heading / which empty copy) so the route
 * stays a thin composer.
 */
interface Props {
  photos: PhotoEntry[]
}

export function PhotosBlock({ photos }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-[14px] font-bold tracking-tight text-foreground">
        Photos
      </h2>
      {photos.length > 0 ? (
        <PhotoTimeline photos={photos} />
      ) : (
        <EmptyState
          icon={<Camera className="h-6 w-6" strokeWidth={1.8} />}
          title="No photos yet"
          body="Attach photos when you submit your weekly check-in."
        />
      )}
    </section>
  )
}
