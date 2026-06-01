import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { initials } from '@/features/profile/utils/initials'
import { ProfileMenuIdentity } from '@/features/profile/components/ProfileMenuIdentity'
import { ProfileMenuItems } from '@/features/profile/components/ProfileMenuItems'
import { useMe } from '@/features/profile/hooks/useMe'

/*
 * SidebarProfileMenu — the desktop identity block + dropdown menu pinned
 * to the bottom of the left sidebar.
 *
 * Implementation: lightweight controlled popover (no @radix-ui/react-popover
 * needed — the org rule discourages new deps). Click trigger toggles open,
 * click outside or Escape closes. Menu pops up ABOVE the trigger via
 * `bottom-full mb-2`.
 *
 * Why not Sheet for desktop: Sheet slides in from the right edge of the
 * viewport, which fights the sidebar's bottom-left anchor. A real anchored
 * dropdown reads as the standard pattern users expect (Stripe, Linear,
 * Future all anchor here).
 *
 * Identity content is rendered TWICE — once in the trigger button (smaller),
 * once in the popover header (with email). That's intentional: the trigger
 * answers "who is logged in?", the popover header confirms it + adds email.
 */
export function SidebarProfileMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { data: me } = useMe()

  const fullName =
    [me?.first_name, me?.last_name].filter(Boolean).join(' ').trim() ||
    null
  const programLine =
    me?.program_week && me?.program_total
      ? `Week ${me.program_week} of ${me.program_total}`
      : null

  useEffect(() => {
    if (!open) return

    function onMouseDown(ev: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(ev.target as Node)
      ) {
        setOpen(false)
      }
    }

    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const ChevronIcon = open ? ChevronUp : ChevronDown

  return (
    <div ref={containerRef} className="relative">
      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 right-0 mb-2 rounded-[16px] border border-[color:var(--border-warm)] bg-card p-1.5 shadow-[0_4px_12px_rgba(15,36,24,.06),0_24px_48px_rgba(15,36,24,.16)]"
        >
          <div className="px-3 py-3">
            <ProfileMenuIdentity
              fullName={fullName}
              email={me?.email}
              size="compact"
            />
          </div>

          <div
            aria-hidden
            className="my-1 mx-1 h-px"
            style={{ background: 'var(--border-warm)' }}
          />

          <ProfileMenuItems
            size="compact"
            onNavigate={() => setOpen(false)}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          'flex w-full items-center gap-3 rounded-[14px] border bg-card px-3 py-2.5 text-left shadow-[var(--shadow-card)] transition-colors',
          open
            ? 'border-[color:var(--green-brand)] border-2'
            : 'border-[color:var(--border-warm)] hover:bg-[color:var(--cream-soft)]',
        ].join(' ')}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-[12px] text-white"
          style={{ background: 'var(--green-brand)' }}
          aria-hidden
        >
          {initials(fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-bold leading-tight text-foreground">
            {fullName ?? 'You'}
          </p>
          <p className="truncate text-[11.5px] text-[color:var(--text-muted)]">
            {programLine ?? me?.email ?? 'Signed in'}
          </p>
        </div>
        <ChevronIcon
          className={[
            'h-4 w-4 shrink-0',
            open ? 'text-[color:var(--green-brand)]' : 'text-[color:var(--text-muted)]',
          ].join(' ')}
          strokeWidth={2}
          aria-hidden
        />
      </button>
    </div>
  )
}
