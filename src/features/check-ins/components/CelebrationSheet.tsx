import { useEffect, useState } from 'react'

import { useCelebrationStore } from '@/stores/celebration'

// Timing budget (mirrored in tokens.css keyframes comment):
//   AUTO_DISMISS_MS — total dwell before auto-exit. Bumped from 1500 to
//     2400 because the entry animations (sheet rise + streak pop + flame
//     glow) take ~1100ms; the old value left only 400ms of actual read
//     time, which felt rushed.
//   EXIT_DUR_MS    — how long the sheet-fall + backdrop-fade-out runs
//     before the component finally unmounts. Without this the sheet
//     used to instantly disappear, which read as jarring.
const AUTO_DISMISS_MS = 2400
const EXIT_DUR_MS = 300
const BACKDROP_DUR_MS = 260
const SHEET_RISE_MS = 380

const ENTER_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)' // easeOutQuint
const EXIT_EASE = 'cubic-bezier(0.4, 0, 1, 1)'      // easeIn — soft sink

const FIRE = '🔥'
function fireString(tier: number): string {
  return FIRE.repeat(Math.max(0, Math.min(5, Math.floor(tier))))
}

export function CelebrationSheet() {
  const pending = useCelebrationStore((s) => s.pending)
  const dismiss = useCelebrationStore((s) => s.dismiss)
  const [visible, setVisible] = useState(false)

  // When a new celebration arrives, show + auto-dismiss after AUTO_DISMISS_MS.
  // Cleaning up the timer in the return value handles the rare case where the
  // user navigates away mid-celebration.
  useEffect(() => {
    if (!pending) return
    setVisible(true)
    // Best-effort iOS haptic — feature-detected; silent on Android/desktop
    // where `vibrate` is either gated by user gesture or not implemented.
    try {
      navigator.vibrate?.(35)
    } catch {
      // ignore
    }
    const t = window.setTimeout(() => {
      setVisible(false)
      // Defer the actual state clear so the exit animation has time to play.
      window.setTimeout(dismiss, EXIT_DUR_MS)
    }, AUTO_DISMISS_MS)
    return () => {
      window.clearTimeout(t)
    }
  }, [pending, dismiss])

  // Stay mounted across the exit animation. Only when `pending` clears (set by
  // dismiss() after EXIT_DUR_MS) does the component actually disappear.
  if (!pending) return null

  const { newCount, newTier, prevTier } = pending
  const fires = fireString(newTier)
  const tierUp = newTier > prevTier && newTier > 0

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Check-in submitted"
      onClick={() => {
        setVisible(false)
        window.setTimeout(dismiss, EXIT_DUR_MS)
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-6"
      style={{
        animation: visible
          ? `backdrop-fade ${BACKDROP_DUR_MS}ms ease-out forwards`
          : `backdrop-fade-out ${BACKDROP_DUR_MS}ms ease-in forwards`,
      }}
    >
      <div
        className="relative w-full max-w-[360px] overflow-hidden rounded-[22px] bg-[var(--green-deep)] px-8 pt-9 pb-7 text-center text-white shadow-[0_24px_70px_rgba(0,0,0,.4)]"
        style={{
          animation: visible
            ? `sheet-rise ${SHEET_RISE_MS}ms ${ENTER_EASE} forwards`
            : `sheet-fall ${EXIT_DUR_MS}ms ${EXIT_EASE} forwards`,
        }}
      >
        {/* Radial glow accent — same one the dashboard hero uses */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64"
          style={{
            background:
              'radial-gradient(circle at center, rgba(46,204,113,.18) 0%, transparent 65%)',
          }}
        />

        {tierUp && (
          <div
            className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.14em]"
            style={{
              background: 'var(--fire-grad)',
              color: 'var(--green-deep)',
            }}
          >
            New tier unlocked
          </div>
        )}

        <div className="relative mt-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55">
          Week logged
        </div>

        <div className="relative mt-2 flex items-baseline justify-center gap-3">
          <div
            className="text-[88px] font-extrabold leading-none tracking-tight tabular-nums"
            style={{ animation: `streak-pop 600ms ${ENTER_EASE} both` }}
          >
            {newCount}
          </div>
          <div className="text-[18px] font-medium text-white/75">
            {newCount === 1 ? 'week' : 'weeks'}
          </div>
        </div>

        {fires && (
          <div
            aria-hidden
            className="relative mt-4 text-[44px] leading-none"
            style={{
              animation: `flame-glow 900ms 200ms ${ENTER_EASE} both`,
            }}
          >
            {fires}
          </div>
        )}

        <p className="relative mt-5 text-[14px] leading-snug text-white/80">
          {newCount === 1
            ? 'Nice start. Same time next week.'
            : tierUp
            ? `You unlocked a new tier. Keep it going.`
            : 'Streak alive. See you next Sunday.'}
        </p>
      </div>
    </div>
  )
}
