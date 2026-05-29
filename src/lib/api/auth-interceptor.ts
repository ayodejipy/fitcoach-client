/*
 * Auth interceptors for the generated hey-api client.
 *
 * Three interceptors register on the singleton client:
 *
 *   1. REQUEST  — attach `Authorization: Bearer <access>` on protected paths
 *                 (skipping login / refresh / accept-invite, which are public
 *                 by definition).
 *
 *   2. RESPONSE — single-flight refresh-on-401. When a protected request
 *                 returns 401, ONE refresh fires; concurrent 401s share the
 *                 in-flight promise. On refresh success we retry the original
 *                 request with the new bearer; on refresh failure we let the
 *                 401 propagate (tokens get cleared inside `refreshOnce`, the
 *                 route gate redirects to /login on the next render).
 *
 *   3. ERROR    — normalize whatever hey-api throws into `AppError`. hey-api
 *                 with throwOnError throws the parsed backend body directly
 *                 (no status, no Response). The error interceptor is the one
 *                 place that has BOTH the body AND the response, so we attach
 *                 status + code + message there in one envelope. After this
 *                 interceptor every caller sees `AppError`, not a raw body.
 *
 * Race safety: the module-level `refreshPromise` is the lock. We never
 * read-then-write the access token across an await boundary without going
 * through this promise.
 *
 * The refresh CALL itself uses the typed `portalRefresh` SDK function from
 * generated code — full type safety on body + response, no magic strings.
 * `/api/v1/portal/auth/refresh` is in PUBLIC_PATHS so the request interceptor
 * doesn't attach a bearer (refresh is body-authenticated) and the response
 * interceptor doesn't try to recurse if the refresh itself 401s.
 */

import { client } from '@/lib/api/generated/client.gen'
import { portalRefresh } from '@/lib/api/generated/sdk.gen'

import { AppError, extractBackendFields } from '@/lib/api/error'
import { useTokensStore } from '@/stores/tokens'

const PUBLIC_PATHS = new Set<string>([
  '/api/v1/portal/auth/login',
  '/api/v1/portal/auth/refresh',
  '/api/v1/portal/accept-invite',
])

let refreshPromise: Promise<string | null> | null = null

async function refreshOnce(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refresh = useTokensStore.getState().refreshToken
    if (!refresh) {
      useTokensStore.getState().clearTokens()
      return null
    }

    try {
      // Typed SDK call. throwOnError: false so we can inspect the result
      // ourselves and decide whether to clear tokens. With responseStyle:
      // 'data' (our default), success returns the body directly; failure
      // returns undefined.
      const data = await portalRefresh({
        body: { refresh_token: refresh },
        throwOnError: false,
      })

      if (!data?.access_token || !data?.refresh_token) {
        useTokensStore.getState().clearTokens()
        return null
      }

      useTokensStore.getState().setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        clientId: data.client_id,
      })
      return data.access_token
    } catch {
      // Network failure during refresh — DON'T clear tokens; the user may
      // just be offline. The 401 will propagate from the response path and
      // a later request can try again.
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function isPublicPath(url: string): boolean {
  try {
    const u = new URL(url, 'http://placeholder')
    return PUBLIC_PATHS.has(u.pathname)
  } catch {
    return false
  }
}

function mergeHeaders(base: Headers, extra: Record<string, string>): Headers {
  const out = new Headers(base)
  for (const [k, v] of Object.entries(extra)) out.set(k, v)
  return out
}

export function registerAuthInterceptors() {
  // 1. Request interceptor — attach Bearer on protected paths.
  client.interceptors.request.use((request) => {
    if (isPublicPath(request.url)) return request
    const token = useTokensStore.getState().accessToken
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  })

  // 2. Response interceptor — single-flight refresh on 401.
  client.interceptors.response.use(async (response, request) => {
    if (response.status !== 401) return response
    if (isPublicPath(request.url)) return response

    const newAccess = await refreshOnce()
    if (!newAccess) return response // let the 401 propagate to error path

    // Replay the original request with the fresh bearer. The retried response
    // replaces the 401 in the chain — the client treats it as the canonical
    // response for this call. Note: this replays request body via the same
    // Request object; for v1 our 401-prone calls are GETs (no body), so this
    // works without explicit cloning. Add request cloning here if/when a POST
    // hits 401-then-retry in practice.
    return fetch(request, {
      headers: mergeHeaders(request.headers, {
        Authorization: `Bearer ${newAccess}`,
      }),
    })
  })

  // 3. Error interceptor — normalize thrown body into AppError.
  // hey-api throws the parsed JSON body directly (with throwOnError + responseStyle: 'data').
  // Status code is only available on the `response` argument here, so this is
  // the one place we can build an AppError that has both status AND backend message.
  client.interceptors.error.use((error, response) => {
    if (error instanceof AppError) return error // already normalized
    const status = response?.status
    const { message, code } = extractBackendFields(error)
    return new AppError({
      status,
      code,
      body: error,
      message:
        message ??
        (status
          ? `Server returned ${status}.`
          : "Can't reach FitCoach. Check your connection and try again."),
    })
  })
}
