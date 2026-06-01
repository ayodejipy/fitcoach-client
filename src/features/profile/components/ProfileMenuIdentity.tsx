import { initials } from '@/features/profile/utils/initials'

/*
 * ProfileMenuIdentity — the avatar + name + email row that sits at the
 * top of both the desktop dropdown and the mobile Sheet.
 *
 * Two visual sizes:
 *   - `compact` — smaller avatar + tighter spacing for the desktop dropdown
 *   - `comfortable` — bigger avatar for the mobile Sheet where there's more
 *     vertical room
 *
 * Pure presentation. Caller passes name + email from `useMe()` data.
 */
interface Props {
  fullName: string | null | undefined
  email: string | null | undefined
  size?: 'compact' | 'comfortable'
}

export function ProfileMenuIdentity({
  fullName,
  email,
  size = 'compact',
}: Props) {
  const displayName = fullName?.trim() || 'You'
  const displayEmail = email?.trim() || ''

  const avatarSize =
    size === 'compact' ? 'h-10 w-10 text-[13px]' : 'h-12 w-12 text-[15px]'
  const nameSize =
    size === 'compact' ? 'text-[14px]' : 'text-[15px]'
  const emailSize =
    size === 'compact' ? 'text-[12px]' : 'text-[12.5px]'

  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          'flex shrink-0 items-center justify-center rounded-full font-bold text-white',
          avatarSize,
        ].join(' ')}
        style={{ background: 'var(--green-brand)' }}
        aria-hidden
      >
        {initials(fullName)}
      </div>
      <div className="min-w-0">
        <p
          className={[
            'truncate font-bold leading-tight tracking-tight text-foreground',
            nameSize,
          ].join(' ')}
        >
          {displayName}
        </p>
        {displayEmail && (
          <p
            className={[
              'truncate text-[color:var(--text-muted)]',
              emailSize,
            ].join(' ')}
          >
            {displayEmail}
          </p>
        )}
      </div>
    </div>
  )
}
