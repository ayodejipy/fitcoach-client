import { create } from 'zustand'

/*
 * Celebration store — short-lived "show the dopamine sheet on the next
 * dashboard render" flag.
 *
 * Lives outside React state because two components are involved:
 *   - `useSubmitCheckIn` (called from the check-in route's hook) sets the
 *     pending payload right before navigating to /dashboard.
 *   - `<CelebrationSheet />` (mounted on the dashboard) reads + renders +
 *     dismisses after the auto-timeout (~1.2s) or on tap.
 *
 * Not persisted — the celebration is a moment, not state to survive a
 * refresh. If the user closes the tab mid-celebration, that's fine.
 */

export interface CelebrationPayload {
  /** Streak count BEFORE this submit (used for the number-rolls-up effect). */
  prevCount: number
  /** Streak count AFTER this submit. */
  newCount: number
  /** Fire tier before the submit (number of flames 0-5). */
  prevTier: number
  /** Fire tier after the submit — when this is greater than prevTier, the
   *  sheet shows a "new tier unlocked" line on top of the standard message. */
  newTier: number
}

interface CelebrationState {
  pending: CelebrationPayload | null
  show: (payload: CelebrationPayload) => void
  dismiss: () => void
}

export const useCelebrationStore = create<CelebrationState>((set) => ({
  pending: null,
  show: (payload) => set({ pending: payload }),
  dismiss: () => set({ pending: null }),
}))
