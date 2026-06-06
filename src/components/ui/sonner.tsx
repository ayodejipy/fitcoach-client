import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react'

/**
 * Brand-tuned Sonner toaster.
 *
 *   ┌──────────────────────────────────────┐
 *   │ ✓  Check-in submitted                │   ← Fraunces title
 *   │    We've notified your coach.        │   ← Inter body, dim
 *   │                                  [x] │
 *   └──────────────────────────────────────┘
 *
 * Position is top-center with an 88px offset (clears the route header on
 * desktop, centered under the mobile nav). Rich-tint variants use the
 * brand palette — success leans on the green family, error on a warm-red
 * wash, warning on the fire-1 amber. Title is Fraunces to match the
 * premium voice; body stays Inter.
 *
 * Dark mode is wired in tokens.css but not toggled in v1 — we hard-code
 * `theme="light"` so toasts don't drift to OS dark while the rest of the
 * portal is still light. Flip to `theme="system"` (or a `.dark`-class
 * observer) when the dark toggle ships.
 */
export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      duration={4500}
      offset={88}
      theme="light"
      icons={{
        success: <CheckCircle2 className="size-[18px]" strokeWidth={2.25} />,
        error: <XCircle className="size-[18px]" strokeWidth={2.25} />,
        warning: <AlertTriangle className="size-[18px]" strokeWidth={2.25} />,
        info: <Info className="size-[18px]" strokeWidth={2.25} />,
        loading: <Loader2 className="size-[18px] animate-spin" strokeWidth={2.25} />,
      }}
      style={
        {
          '--normal-bg': 'var(--bg-surface)',
          '--normal-text': 'var(--text-primary)',
          '--normal-border': 'var(--border)',

          '--success-bg': 'var(--green-pale)',
          '--success-text': 'var(--green-deep)',
          '--success-border': 'var(--green-mid)',

          '--error-bg': '#FEE7E5',
          '--error-text': '#7F1D1D',
          '--error-border': '#FCA5A5',

          '--warning-bg': '#FFF4E0',
          '--warning-text': '#7C2D12',
          '--warning-border': '#FDD9A6',

          '--info-bg': 'var(--bg-surface-muted)',
          '--info-text': 'var(--text-primary)',
          '--info-border': 'var(--border-strong)',

          fontFamily: 'var(--font-body)',
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lift)',
          // Right padding is bumped to 48px to reserve space for the
          // right-centered close button (24px circle + 12px edge gap +
          // some breathing room) so long titles can't slide under it.
          padding: '14px 48px 14px 16px',
          gap: '12px',
          width: '380px',
          maxWidth: '92vw',
        },
        classNames: {
          title:
            '[font-family:var(--font-display)] text-[15px] font-semibold tracking-tight leading-snug',
          description: 'text-[13px] leading-snug opacity-85 mt-0.5',
          icon: 'mt-0.5 shrink-0',
          // Close-button sizing, placement, and hover state live entirely
          // in index.css alongside the global tap-floor rule it has to
          // opt out of. No Tailwind classes needed here.
        },
      }}
      {...props}
    />
  )
}
