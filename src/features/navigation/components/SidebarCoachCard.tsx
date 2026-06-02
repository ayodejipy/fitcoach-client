import { initials } from '@/features/profile/utils/initials'

interface Props {
  coachName: string | null | undefined
}

export function SidebarCoachCard({ coachName }: Props) {
  if (!coachName) return null

  return (
    <div
      className="mx-3 rounded-[12px] border px-3.5 py-3"
      style={{
        background: 'var(--cream-soft)',
        borderColor: 'var(--border-warm)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-[12px] text-white"
          style={{ background: 'var(--green-deep)' }}
          aria-hidden
        >
          {initials(coachName)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold leading-tight text-foreground">
            {coachName}
          </p>
          <p className="mt-0.5 truncate text-[11.5px] text-[color:var(--text-muted)]">
            Your coach
          </p>
        </div>
      </div>
    </div>
  )
}
