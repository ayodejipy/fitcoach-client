import { http, HttpResponse, delay } from 'msw'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppError } from '@/lib/api/error'
import {
  portalGetMe,
  portalLogin,
  portalListNotifications,
  portalUnreadNotificationCount,
} from '@/lib/api/generated/sdk.gen'
import { useTokensStore } from '@/stores/tokens'

import {
  SAMPLE_LOGIN_RESPONSE,
  SAMPLE_REFRESH_RESPONSE,
} from '@/test/msw/handlers'
import { server, TEST_BASE_URL } from '@/test/msw/server'
import { configureTestClient } from '@/test/test-client'

/*
 * auth-interceptor.test — the spine guarantees the rest of the app relies on:
 *
 *   1. Bearer header attached on protected paths
 *   2. NO bearer on PUBLIC_PATHS (login / refresh / accept-invite)
 *   3. Single-flight refresh-on-401 — concurrent 401s share ONE refresh call
 *   4. After refresh, the original request retries with the new bearer
 *   5. Refresh failure clears tokens (when refresh returns 401 explicitly)
 *      and the original 401 propagates as AppError
 *   6. Public-path 401 does NOT trigger refresh (would recurse)
 *   7. Error normalization: thrown bodies become AppError with status + code
 *
 * The interceptor is configured ONCE via `configureTestClient()`. Tests
 * reset MSW handlers + tokens before each case.
 */

describe('auth interceptor', () => {
  beforeAll(() => {
    configureTestClient()
  })

  beforeEach(() => {
    useTokensStore.getState().clearTokens()
  })

  afterEach(() => {
    useTokensStore.getState().clearTokens()
  })

  describe('request interceptor — bearer header', () => {
    it('attaches Authorization: Bearer on protected paths when access token is set', async () => {
      useTokensStore.getState().setTokens({
        accessToken: 'access-XYZ',
        refreshToken: 'refresh-XYZ',
      })

      let observedAuth: string | null = null
      server.use(
        http.get(`${TEST_BASE_URL}/api/v1/portal/me`, ({ request }) => {
          observedAuth = request.headers.get('authorization')
          return HttpResponse.json({ first_name: 'Sam' })
        }),
      )

      await portalGetMe()
      expect(observedAuth).toBe('Bearer access-XYZ')
    })

    it('does NOT attach bearer on public paths (login)', async () => {
      useTokensStore.getState().setTokens({
        accessToken: 'access-XYZ',
        refreshToken: 'refresh-XYZ',
      })

      let observedAuth: string | null = null
      server.use(
        http.post(
          `${TEST_BASE_URL}/api/v1/portal/auth/login`,
          ({ request }) => {
            observedAuth = request.headers.get('authorization')
            return HttpResponse.json(SAMPLE_LOGIN_RESPONSE)
          },
        ),
      )

      await portalLogin({ body: { email: 'a@b.com', password: 'pw' } })
      expect(observedAuth).toBeNull()
    })

    it('skips bearer when no access token is set', async () => {
      let observedAuth: string | null = null
      server.use(
        http.get(`${TEST_BASE_URL}/api/v1/portal/me`, ({ request }) => {
          observedAuth = request.headers.get('authorization')
          return HttpResponse.json({ first_name: 'Sam' })
        }),
      )

      await portalGetMe()
      expect(observedAuth).toBeNull()
    })
  })

  describe('response interceptor — single-flight refresh on 401', () => {
    it('refreshes once when a protected request 401s, then retries successfully', async () => {
      useTokensStore.getState().setTokens({
        accessToken: 'stale-token',
        refreshToken: 'good-refresh',
      })

      let meHits = 0
      let refreshHits = 0
      server.use(
        http.get(`${TEST_BASE_URL}/api/v1/portal/me`, ({ request }) => {
          meHits++
          const auth = request.headers.get('authorization') ?? ''
          if (auth.includes('stale-token')) {
            return HttpResponse.json(
              { code: 'TOKEN_EXPIRED', error: 'token expired' },
              { status: 401 },
            )
          }
          return HttpResponse.json({ first_name: 'Sam' })
        }),
        http.post(`${TEST_BASE_URL}/api/v1/portal/auth/refresh`, () => {
          refreshHits++
          return HttpResponse.json(SAMPLE_REFRESH_RESPONSE)
        }),
      )

      const data = await portalGetMe()
      expect(data?.first_name).toBe('Sam')
      // Once with the stale token (401), once with the refreshed token (200).
      expect(meHits).toBe(2)
      expect(refreshHits).toBe(1)
      // Tokens rotated to the refresh response values.
      expect(useTokensStore.getState().accessToken).toBe(
        SAMPLE_REFRESH_RESPONSE.access_token,
      )
      expect(useTokensStore.getState().refreshToken).toBe(
        SAMPLE_REFRESH_RESPONSE.refresh_token,
      )
    })

    it('shares ONE refresh call across N concurrent 401s', async () => {
      useTokensStore.getState().setTokens({
        accessToken: 'stale-token',
        refreshToken: 'good-refresh',
      })

      let refreshHits = 0
      server.use(
        http.get(`${TEST_BASE_URL}/api/v1/portal/me`, ({ request }) => {
          const auth = request.headers.get('authorization') ?? ''
          if (auth.includes('stale-token')) {
            return HttpResponse.json(
              { code: 'TOKEN_EXPIRED', error: 'token expired' },
              { status: 401 },
            )
          }
          return HttpResponse.json({ first_name: 'Sam' })
        }),
        http.get(
          `${TEST_BASE_URL}/api/v1/portal/notifications/unread-count`,
          ({ request }) => {
            const auth = request.headers.get('authorization') ?? ''
            if (auth.includes('stale-token')) {
              return HttpResponse.json(
                { code: 'TOKEN_EXPIRED', error: 'token expired' },
                { status: 401 },
              )
            }
            return HttpResponse.json({ count: 3 })
          },
        ),
        http.get(
          `${TEST_BASE_URL}/api/v1/portal/notifications`,
          ({ request }) => {
            const auth = request.headers.get('authorization') ?? ''
            if (auth.includes('stale-token')) {
              return HttpResponse.json(
                { code: 'TOKEN_EXPIRED', error: 'token expired' },
                { status: 401 },
              )
            }
            return HttpResponse.json({
              notifications: [],
              page: 1,
              per_page: 100,
              total: 0,
              total_pages: 0,
            })
          },
        ),
        http.post(`${TEST_BASE_URL}/api/v1/portal/auth/refresh`, async () => {
          refreshHits++
          // Hold the refresh open briefly so concurrent 401s converge on it.
          await delay(40)
          return HttpResponse.json(SAMPLE_REFRESH_RESPONSE)
        }),
      )

      // Fire three protected requests in parallel — they all 401, then all
      // queue on the SAME refresh promise, then all retry.
      const results = await Promise.all([
        portalGetMe(),
        portalUnreadNotificationCount(),
        portalListNotifications(),
      ])

      // All three succeeded after the retry.
      expect(results[0]?.first_name).toBe('Sam')
      expect(results[1]?.count).toBe(3)
      expect(results[2]?.notifications).toEqual([])

      // The whole point of the single-flight lock — refresh fired exactly once.
      expect(refreshHits).toBe(1)
    })

    it('does NOT refresh when the 401 comes from a public path (would recurse)', async () => {
      let refreshHits = 0
      server.use(
        http.post(`${TEST_BASE_URL}/api/v1/portal/auth/login`, () =>
          HttpResponse.json(
            { code: 'INVALID_CREDENTIALS', error: 'invalid email or password' },
            { status: 401 },
          ),
        ),
        http.post(`${TEST_BASE_URL}/api/v1/portal/auth/refresh`, () => {
          refreshHits++
          return HttpResponse.json(SAMPLE_REFRESH_RESPONSE)
        }),
      )

      try {
        await portalLogin({ body: { email: 'a@b.com', password: 'wrong' } })
        throw new Error('expected login to throw')
      } catch (e) {
        expect(e).toBeInstanceOf(AppError)
        const err = e as AppError
        expect(err.status).toBe(401)
        expect(err.code).toBe('INVALID_CREDENTIALS')
      }
      // Refresh was never attempted — public path 401 propagates raw.
      expect(refreshHits).toBe(0)
    })

    it('clears tokens when refresh itself returns 401 (refresh-token rejected)', async () => {
      useTokensStore.getState().setTokens({
        accessToken: 'stale-token',
        refreshToken: 'expired-refresh',
      })

      server.use(
        http.get(`${TEST_BASE_URL}/api/v1/portal/me`, () =>
          HttpResponse.json(
            { code: 'TOKEN_EXPIRED', error: 'token expired' },
            { status: 401 },
          ),
        ),
        http.post(`${TEST_BASE_URL}/api/v1/portal/auth/refresh`, () =>
          HttpResponse.json(
            { code: 'TOKEN_REVOKED', error: 'refresh token revoked' },
            { status: 401 },
          ),
        ),
      )

      // Original 401 propagates (because refresh failed). Should throw AppError.
      await expect(portalGetMe()).rejects.toBeInstanceOf(AppError)

      // Tokens cleared so the route gate redirects to /login on next render.
      expect(useTokensStore.getState().accessToken).toBeNull()
      expect(useTokensStore.getState().refreshToken).toBeNull()
    })
  })

  describe('error interceptor — AppError normalization', () => {
    it('wraps a thrown backend body with status + code from the response', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/v1/portal/me`, () =>
          HttpResponse.json(
            { code: 'NOT_FOUND', error: 'user not found' },
            { status: 404 },
          ),
        ),
      )

      try {
        await portalGetMe()
        throw new Error('expected portalGetMe to throw')
      } catch (e) {
        expect(e).toBeInstanceOf(AppError)
        const err = e as AppError
        expect(err.status).toBe(404)
        expect(err.code).toBe('NOT_FOUND')
        expect(err.message).toBe('user not found')
      }
    })

    it('falls back to a generic message when the body has no `error` field', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/v1/portal/me`, () =>
          HttpResponse.json({ irrelevant: 'noise' }, { status: 500 }),
        ),
      )

      try {
        await portalGetMe()
        throw new Error('expected portalGetMe to throw')
      } catch (e) {
        const err = e as AppError
        expect(err.status).toBe(500)
        expect(err.message).toBe('Server returned 500.')
      }
    })
  })
})
