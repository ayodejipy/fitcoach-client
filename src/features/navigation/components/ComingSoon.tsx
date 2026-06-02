import type { ReactNode } from 'react'
interface Props {
  icon: ReactNode
  title: string
  body: string
}

export function ComingSoon({ icon, title, body }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed border-border bg-[color:var(--bg-surface-muted)] px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-[color:var(--text-secondary)]">
        {icon}
      </div>
      <div>
        <p className="text-[15px] font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[13px] text-[color:var(--text-secondary)]">
          {body}
        </p>
      </div>
    </div>
  )
}
