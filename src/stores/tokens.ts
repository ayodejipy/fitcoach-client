import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/*
 * Tokens store — the single source of truth for client portal auth state.
 *
 * Storage strategy (locked by /plan-eng-review Decision 1A):
 *   - `accessToken`: in memory only. Cleared on hard refresh. Short TTL (15m).
 *   - `refreshToken`: persisted to localStorage so the session survives PWA-less
 *     cold starts (open tab → close → reopen later). 7d TTL once the backend
 *     env is set to REFRESH_TOKEN_TTL_DAYS=7 (Task T1).
 *
 * Security tradeoffs (locked by the design doc's auth-storage section):
 *   - Refresh token in localStorage is XSS-exposed. Mitigations: strict CSP,
 *     ZERO third-party scripts in the portal, server-side refresh rotation
 *     + reuse-detection, 7d TTL (down from 30d default).
 *   - Access token in memory only — even an XSS payload can't easily exfil it.
 *
 * Outside-React access: the auth interceptor (src/lib/api/auth-interceptor.ts)
 * runs outside the React tree and reads/writes tokens via
 * `useTokensStore.getState()` / `useTokensStore.setState()`. That is the
 * specific reason Zustand was chosen over React Context (Context can't be read
 * from a non-React fetch wrapper without prop drilling or singletons).
 */

interface TokensState {
  /** Short-lived JWT used as the Bearer credential. Memory only. */
  accessToken: string | null
  /** Long-lived opaque (or JWT) used to mint new access tokens. Persisted. */
  refreshToken: string | null
  /** Client identity (returned by login/refresh; not strictly needed but useful). */
  clientId: string | null

  isAuthenticated: () => boolean
  setTokens: (tokens: {
    accessToken: string
    refreshToken: string
    clientId?: string
  }) => void
  /** Wipes all tokens. Called from logout AND from refresh-failure paths. */
  clearTokens: () => void
}

export const useTokensStore = create<TokensState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      clientId: null,

      isAuthenticated: () => Boolean(get().refreshToken),

      setTokens: ({ accessToken, refreshToken, clientId }) =>
        set({
          accessToken,
          refreshToken,
          clientId: clientId ?? get().clientId ?? null,
        }),

      clearTokens: () =>
        set({ accessToken: null, refreshToken: null, clientId: null }),
    }),
    {
      name: 'fitcoach.portal.tokens',
      storage: createJSONStorage(() => localStorage),
      /*
       * Persist ONLY refresh + clientId. Access token MUST NOT touch storage.
       * `partialize` is the canonical Zustand-persist hook for this.
       */
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        clientId: state.clientId,
      }),
      version: 1,
    },
  ),
)

/*
 * Convenience accessor for the auth interceptor — saves typing
 * `useTokensStore.getState().accessToken` 20 times.
 */
export const getAccessToken = () => useTokensStore.getState().accessToken
export const getRefreshToken = () => useTokensStore.getState().refreshToken
