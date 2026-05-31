import { useEffect, useRef } from 'react'

import { portalIssueWsTicket } from '@/lib/api/generated/sdk.gen'

/*
 * usePortalWs — opens the authenticated portal WebSocket and dispatches
 * server-pushed JSON messages to the caller's `onMessage` handler.
 *
 * Lifecycle (Decision 2A revised — naive reconnect-while-visible):
 *   1. Mount + `enabled` + tab visible → fetch a fresh 30s ticket via
 *      POST /api/v1/portal/ws/ticket, then open
 *      WSS /api/v1/portal/ws?ticket=…
 *   2. On message → JSON.parse → onMessage(payload). Parse failures are
 *      logged in dev and swallowed in prod — a malformed frame should not
 *      kill the connection.
 *   3. On unexpected close → if still visible + enabled, reconnect after a
 *      capped exponential backoff (1s → 2s → 4s → 8s → 15s cap). Counter
 *      resets on a successful open.
 *   4. On `visibilitychange`:
 *        - hidden  → close immediately, cancel pending reconnect (saves
 *          server connections + battery; nothing arrives anyway because the
 *          tab is not foregrounded).
 *        - visible → reopen if currently disconnected.
 *   5. On unmount → tear everything down, mark the socket as deliberately
 *      closed so the close handler doesn't try to reconnect.
 *
 * Why naive over a heavier reconnect library: notifications are not the
 * critical path. If a push is missed during a reconnect window, the unread
 * badge's TanStack Query (`useUnreadCount`) refetches on window focus and
 * fills in the gap. The WS is a NUDGE — the source of truth is HTTP.
 *
 * Why a fresh ticket per connection: tickets are single-use and 30s short.
 * That keeps the WSS URL itself unguessable + replay-resistant. Open-the-
 * socket-with-a-stale-token attacks don't apply.
 *
 * Why the `enabled` flag: lets the caller wait until auth is settled
 * (`useTokensStore.isAuthenticated()`). Opening without auth would 401 the
 * ticket request and spin a useless reconnect loop.
 *
 * The hook returns nothing — it is a pure side-effect at the layout level.
 * If a screen ever needs WS-derived data, it should subscribe via TanStack
 * Query invalidation (the pattern useNotificationsRealtime uses), NOT by
 * re-mounting this hook.
 */

const MAX_BACKOFF_MS = 15_000
const INITIAL_BACKOFF_MS = 1_000

interface UsePortalWsArgs {
  /** When false, the socket stays closed (e.g. before auth lands). */
  enabled: boolean
  /** Called for every JSON-parsed message. Caller decides what to do with it. */
  onMessage: (payload: unknown) => void
}

export function usePortalWs({ enabled, onMessage }: UsePortalWsArgs): void {
  // Refs hold the live connection + reconnect state. We don't expose this in
  // React state because re-rendering on connect/disconnect would force
  // every consumer of the layout to re-render — pointless work.
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const backoffRef = useRef<number>(INITIAL_BACKOFF_MS)
  const closedDeliberatelyRef = useRef<boolean>(false)
  // The latest onMessage callback. Stored in a ref so the WS handlers below
  // always call the freshest version without us tearing down + rebuilding
  // the socket whenever the caller's closure changes identity.
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!enabled) return

    function clearReconnect() {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
    }

    function closeSocket(deliberate: boolean) {
      closedDeliberatelyRef.current = deliberate
      clearReconnect()
      if (socketRef.current) {
        try {
          socketRef.current.close()
        } catch {
          // ignore — already closed
        }
        socketRef.current = null
      }
    }

    async function connect() {
      // Don't pile up sockets — if one is already open or opening, skip.
      if (socketRef.current) return
      if (document.visibilityState === 'hidden') return

      let ticket: string | undefined
      try {
        const data = await portalIssueWsTicket({ throwOnError: false })
        ticket = data?.ticket
      } catch {
        ticket = undefined
      }
      if (!ticket) {
        scheduleReconnect()
        return
      }

      // Build the WSS URL from the current origin so dev + prod work without
      // a separate env var. The Vite dev proxy is configured with `ws: true`
      // to forward the upgrade to the Go backend on :8080.
      const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const url = `${scheme}://${window.location.host}/api/v1/portal/ws?ticket=${encodeURIComponent(ticket)}`

      const ws = new WebSocket(url)
      socketRef.current = ws
      closedDeliberatelyRef.current = false

      ws.addEventListener('open', () => {
        // A successful open resets the backoff so the NEXT unexpected drop
        // gets the short retry, not whatever the last failure ended at.
        backoffRef.current = INITIAL_BACKOFF_MS
      })

      ws.addEventListener('message', (ev) => {
        try {
          const payload = JSON.parse(typeof ev.data === 'string' ? ev.data : '')
          onMessageRef.current(payload)
        } catch (e) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn('[ws] dropped non-JSON message', e)
          }
        }
      })

      ws.addEventListener('close', () => {
        socketRef.current = null
        if (closedDeliberatelyRef.current) return
        if (document.visibilityState === 'hidden') return
        scheduleReconnect()
      })

      ws.addEventListener('error', () => {
        // The close handler will fire right after and handle reconnect.
        // Nothing useful to do here beyond letting it run.
      })
    }

    function scheduleReconnect() {
      clearReconnect()
      const delay = backoffRef.current
      backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS)
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null
        void connect()
      }, delay)
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        closeSocket(true)
        // Reset backoff so when we come back, the first attempt is fast.
        backoffRef.current = INITIAL_BACKOFF_MS
      } else {
        void connect()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    void connect()

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      closeSocket(true)
    }
  }, [enabled])
}
