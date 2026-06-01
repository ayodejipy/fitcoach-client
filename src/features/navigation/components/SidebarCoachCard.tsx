import { initials } from '@/features/profile/utils/initials'

/*
 * SidebarCoachCard — coach + program-progress card pinned above the
 * profile menu in the desktop sidebar.
 *
 * Lifted from the variant-B sidebar mockup: brand-pale background, coach
 * avatar with a small accent dot, program week progress bar across the
 * bottom. Reads as "your coach is here, and here's how far through the
 * program you are" — the warmest brand moment on the gated chrome.
 *
 * Pure presentation. Renders null when there's no coach name (e.g. a
 * client whose coach has been removed) — better than rendering an empty
 * card with placeholder dashes.
 *
 * Caller passes coach + program data sliced from `useMe()` so the card
 * doesn't introduce its own fetch.
 */
interface Props {
  coachName: string | null | undefined
  programWeek: number | null | undefined
  programTotal: number | null | undefined
}

export function SidebarCoachCard({
  coachName,
  programWeek,
  programTotal,
}: Props) {
  if (!coachName) return null

  const hasProgram =
    typeof programWeek === 'number' &&
    typeof programTotal === 'number' &&
    programTotal > 0
  const percent = hasProgram
    ? Math.min(100, Math.round((programWeek! / programTotal!) * 100))
    : 0

  return (
    <div
      className="mx-3 mb-3 rounded-[14px] border px-4 py-3.5"
      style={{
        background: 'var(--green-pale)',
        borderColor: 'var(--green-soft)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-[12px] text-white ring-2 ring-white"
            style={{ background: 'var(--green-deep)' }}
            aria-hidden
          >
            {initials(coachName)}
          </div>
          <span
            aria-hidden
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2"
            style={{ background: 'var(--green-brand)', boxShadow: '0 0 0 2px var(--green-pale)' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-[12px] font-bold leading-tight"
            style={{ color: 'var(--green-deep)' }}
          >
            {coachName}
          </p>
          <p
            className="mt-0.5 truncate text-[11px]"
            style={{ color: 'var(--green-brand)' }}
          >
            Your coach
          </p>
        </div>
      </div>

      {hasProgram && (
        <div
          className="mt-3 pt-3 border-t"
          style={{ borderColor: 'var(--green-soft)' }}
        >
          <div className="flex items-center justify-between text-[11.5px]">
            <span
              className="font-bold"
              style={{ color: 'var(--green-deep)' }}
            >
              Week {programWeek} of {programTotal}
            </span>
            <span
              className="tabular-nums"
              style={{ color: 'var(--green-brand)' }}
            >
              {percent}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${percent}%`,
                background: 'var(--green-brand)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
