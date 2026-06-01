import { useState } from 'react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ProfileMenuIdentity } from '@/features/profile/components/ProfileMenuIdentity'
import { ProfileMenuItems } from '@/features/profile/components/ProfileMenuItems'
import { initials } from '@/features/profile/utils/initials'
import { useMe } from '@/features/profile/hooks/useMe'

/*
 * MobileProfileMenu — the mobile-only top-right avatar trigger + bottom
 * Sheet. Mounted once in `_app.tsx` so the avatar floats on every gated
 * page (lg:hidden so desktop just uses the sidebar).
 *
 * Trigger: fixed top-right circular avatar button. Position calibrated to
 * sit above page content (`top-3.5 right-4`) without colliding with the
 * dashboard's GreetingHeader bell (which sits inside the page padding,
 * starting at ~24px from top).
 *
 * Sheet: slides up from the bottom (matches mobile menu mockup). Sheet
 * content has a deep-forest identity band on top via ProfileMenuIdentity,
 * then ProfileMenuItems with roomier touch targets.
 *
 * Why side="bottom": the mockup's Sheet slides from the bottom. The radix
 * primitive supports it via the `side` prop on SheetContent — we pass
 * `side="bottom"` so the content slides up rather than from the right
 * (the default).
 */
export function MobileProfileMenu() {
  const [open, setOpen] = useState(false)
  const { data: me } = useMe()

  const fullName =
    [me?.first_name, me?.last_name].filter(Boolean).join(' ').trim() || null

  return (
    <div className="fixed right-4 top-3.5 z-40 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Open account menu"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-[var(--shadow-card)] ring-1 ring-[color:var(--border-warm)]"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: 'var(--green-brand)' }}
              aria-hidden
            >
              {initials(fullName)}
            </span>
          </button>
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="rounded-t-[24px] border-t-0 bg-card p-0 pb-6 lg:hidden"
        >
          {/*
           * Sheet primitive requires a Title for a11y. We render it visually
           * via the identity row below, but the Radix-managed accessible
           * name comes from this hidden title. SheetDescription likewise
           * satisfies the a11y warning without visual noise.
           */}
          <SheetTitle className="sr-only">Account menu</SheetTitle>
          <SheetDescription className="sr-only">
            Navigation, billing, and sign out.
          </SheetDescription>

          {/* Pull handle */}
          <div
            aria-hidden
            className="mx-auto mt-2 h-1 w-10 rounded-full bg-[color:var(--text-muted)]/40"
          />

          <div className="px-5 pt-4">
            <ProfileMenuIdentity
              fullName={fullName}
              email={me?.email}
              size="comfortable"
            />
          </div>

          <div
            aria-hidden
            className="mx-5 mt-4 h-px"
            style={{ background: 'var(--border-warm)' }}
          />

          <div className="px-2 pt-2">
            <ProfileMenuItems
              size="roomy"
              onNavigate={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
