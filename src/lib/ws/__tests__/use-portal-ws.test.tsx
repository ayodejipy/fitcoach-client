import { http, HttpResponse } from 'msw'
import { renderHook } from '@testing-library/react'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { usePortalWs } from '@/lib/ws/use-portal-ws'

import { server, TEST_BASE_URL } from '@/test/msw/server'
import { configureTestClient } from '@/test/test-client'

/*
 * use-portal-ws.test — the WS lifecycle harness.
 *
 * What this test fakes:
 *   - global.WebSocket → MockWebSocket: capture every constructed instance,
 *     expose open/close/message triggers, count close() calls.
 *   - document.visibilityState → controllable via setVisibility().
 *   - setTimeout → vi.useFakeTimers so the reconnect backoff is testable
 *     without real-time waits.
 *
 * What this test does NOT fake:
 *   - The MSW server (set up globally). Ticket POSTs go through normal
 *     handlers so the request-side of the hook is exercised end-to-end.
 */

const TICKET_URL = `${TEST_BASE_URL}/api/v1/portal/ws/ticket`

interface InstrumentedSocket {
  url: string
  closeCalls: number
  listeners: Record<string, ((ev: Event | MessageEvent) => void)[]>
  fireOpen: () => void
  fireMessage: (data: string) => void
  fireClose: () => void
  fireError: () => void
}

/**
 * Minimal WebSocket double with the methods the hook actually calls
 * (addEventListener, close). Each `new MockWebSocket(url)` is captured on
 * `created` so tests can assert URL + drive lifecycle events.
 */
function setupMockWebSocket() {
  const created: InstrumentedSocket[] = []

  class MockWS {
    url: string
    listeners: Record<string, ((ev: Event | MessageEvent) => void)[]> = {}
    closeCalls = 0

    constructor(url: string) {
      this.url = url
      const inst: InstrumentedSocket = {
        url,
        listeners: this.listeners,
        closeCalls: 0,
        fireOpen: () => this.dispatch('open', new Event('open')),
        fireMessage: (data: string) =>
          this.dispatch(
            'message',
            new MessageEvent('message', { data }),
          ),
        fireClose: () => this.dispatch('close', new Event('close')),
        fireError: () => this.dispatch('error', new Event('error')),
      }
      // Bridge `closeCalls` so tests reading via `created` see live counts.
      Object.defineProperty(inst, 'closeCalls', {
        get: () => this.closeCalls,
      })
      created.push(inst)
    }

    addEventListener(
      ev: string,
      cb: (e: Event | MessageEvent) => void,
    ): void {
      ;(this.listeners[ev] ??= []).push(cb)
    }

    close(): void {
      this.closeCalls++
    }

    dispatch(ev: string, event: Event): void {
      const list = this.listeners[ev] ?? []
      for (const cb of list) cb(event)
    }
  }

  vi.stubGlobal('WebSocket', MockWS as unknown as typeof WebSocket)
  return { created }
}

/** Control document.visibilityState + fire the change event. */
function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('usePortalWs', () => {
  let created: InstrumentedSocket[]

  beforeAll(() => {
    configureTestClient()
  })

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    setVisibility('visible')
    const mock = setupMockWebSocket()
    created = mock.created
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe('enabled gating', () => {
    it('does NOT open a socket when enabled=false', async () => {
      let ticketHit = false
      server.use(
        http.post(TICKET_URL, () => {
          ticketHit = true
          return HttpResponse.json({ ticket: 't', expires_at: '2099' })
        }),
      )

      renderHook(() =>
        usePortalWs({ enabled: false, onMessage: () => {} }),
      )

      // Give microtasks a chance to flush.
      await Promise.resolve()
      expect(created).toHaveLength(0)
      expect(ticketHit).toBe(false)
    })

    it('opens a socket with the ticket in the URL when enabled=true', async () => {
      server.use(
        http.post(TICKET_URL, () =>
          HttpResponse.json({ ticket: 'TKT-123', expires_at: '2099' }),
        ),
      )

      renderHook(() =>
        usePortalWs({ enabled: true, onMessage: () => {} }),
      )

      // Wait for ticket fetch + socket creation.
      await vi.waitFor(() => {
        expect(created).toHaveLength(1)
      })
      expect(created[0]?.url).toMatch(/\/api\/v1\/portal\/ws\?ticket=TKT-123/)
    })

    it('does NOT open a socket when the ticket fetch fails', async () => {
      server.use(
        http.post(TICKET_URL, () =>
          HttpResponse.json(
            { code: 'TICKET_DENIED', error: 'no' },
            { status: 503 },
          ),
        ),
      )

      renderHook(() =>
        usePortalWs({ enabled: true, onMessage: () => {} }),
      )

      // Give the ticket fetch + the scheduled retry a beat — neither should
      // produce a socket without a valid ticket.
      await Promise.resolve()
      await Promise.resolve()
      expect(created).toHaveLength(0)
    })
  })

  describe('message dispatch', () => {
    it('JSON.parses messages and forwards to onMessage', async () => {
      server.use(
        http.post(TICKET_URL, () =>
          HttpResponse.json({ ticket: 't', expires_at: '2099' }),
        ),
      )

      const onMessage = vi.fn()
      renderHook(() => usePortalWs({ enabled: true, onMessage }))

      await vi.waitFor(() => expect(created).toHaveLength(1))
      created[0]!.fireOpen()
      created[0]!.fireMessage(
        JSON.stringify({ type: 'coach_reply', data: { preview: 'hi' } }),
      )

      expect(onMessage).toHaveBeenCalledWith({
        type: 'coach_reply',
        data: { preview: 'hi' },
      })
    })

    it('silently drops non-JSON messages without calling onMessage', async () => {
      server.use(
        http.post(TICKET_URL, () =>
          HttpResponse.json({ ticket: 't', expires_at: '2099' }),
        ),
      )

      const onMessage = vi.fn()
      renderHook(() => usePortalWs({ enabled: true, onMessage }))

      await vi.waitFor(() => expect(created).toHaveLength(1))
      created[0]!.fireMessage('not-json-{{{')

      expect(onMessage).not.toHaveBeenCalled()
    })
  })

  describe('reconnect behavior', () => {
    it('reconnects after an unexpected close while visible', async () => {
      server.use(
        http.post(TICKET_URL, () =>
          HttpResponse.json({ ticket: 't', expires_at: '2099' }),
        ),
      )

      renderHook(() =>
        usePortalWs({ enabled: true, onMessage: () => {} }),
      )

      await vi.waitFor(() => expect(created).toHaveLength(1))
      created[0]!.fireOpen()
      created[0]!.fireClose() // unexpected drop while visible

      // Advance past the 1000ms initial backoff → new socket attempted.
      await vi.advanceTimersByTimeAsync(1100)
      await vi.waitFor(() => expect(created).toHaveLength(2))
    })

    it('does NOT reconnect when the tab is hidden', async () => {
      server.use(
        http.post(TICKET_URL, () =>
          HttpResponse.json({ ticket: 't', expires_at: '2099' }),
        ),
      )

      renderHook(() =>
        usePortalWs({ enabled: true, onMessage: () => {} }),
      )

      await vi.waitFor(() => expect(created).toHaveLength(1))
      created[0]!.fireOpen()

      // Tab goes hidden → hook closes socket deliberately, cancels reconnect.
      setVisibility('hidden')

      // The previous socket close was deliberate; no reconnect should fire
      // regardless of how much time passes.
      await vi.advanceTimersByTimeAsync(60_000)
      expect(created).toHaveLength(1)
    })

    it('reopens when visibility returns to visible after being hidden', async () => {
      server.use(
        http.post(TICKET_URL, () =>
          HttpResponse.json({ ticket: 't', expires_at: '2099' }),
        ),
      )

      renderHook(() =>
        usePortalWs({ enabled: true, onMessage: () => {} }),
      )

      await vi.waitFor(() => expect(created).toHaveLength(1))
      created[0]!.fireOpen()
      setVisibility('hidden')
      await Promise.resolve()

      // Coming back visible should trigger a fresh ticket + new socket.
      setVisibility('visible')
      await vi.waitFor(() => expect(created).toHaveLength(2))
    })
  })

  describe('cleanup', () => {
    it('closes the socket and detaches visibility listener on unmount', async () => {
      server.use(
        http.post(TICKET_URL, () =>
          HttpResponse.json({ ticket: 't', expires_at: '2099' }),
        ),
      )

      const { unmount } = renderHook(() =>
        usePortalWs({ enabled: true, onMessage: () => {} }),
      )

      await vi.waitFor(() => expect(created).toHaveLength(1))
      created[0]!.fireOpen()

      const socketAtUnmount = created[0]!
      unmount()

      expect(socketAtUnmount.closeCalls).toBeGreaterThanOrEqual(1)

      // After unmount, a hidden→visible cycle should NOT open a new socket.
      setVisibility('hidden')
      setVisibility('visible')
      await vi.advanceTimersByTimeAsync(60_000)
      expect(created).toHaveLength(1)
    })
  })
})
