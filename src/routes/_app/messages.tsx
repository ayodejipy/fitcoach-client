import { createFileRoute } from '@tanstack/react-router'
import { MessageCircle } from 'lucide-react'

import { ComingSoon } from '@/features/navigation/components/ComingSoon'

/*
 * `/messages` — placeholder route.
 *
 * The real implementation lands with Task T8: the WS-driven coach reply nudge,
 * threaded message list, and compose box. For now the tab is reachable so the
 * nav has all four destinations live.
 */
export const Route = createFileRoute('/_app/messages')({
  component: MessagesPage,
})

function MessagesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-foreground">
          Messages
        </h1>
        <p className="mt-1 text-[13px] text-[color:var(--text-secondary)]">
          Talk to your coach.
        </p>
      </header>

      <ComingSoon
        icon={<MessageCircle className="h-7 w-7" strokeWidth={1.8} />}
        title="Coach messaging is coming"
        body="You'll get a nudge here the moment your coach replies."
      />
    </div>
  )
}
