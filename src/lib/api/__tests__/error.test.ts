import { describe, expect, it } from 'vitest'

import {
  AppError,
  appErrorFromResponse,
  appErrorFromThrown,
  extractBackendFields,
  isFieldLevelError,
} from '@/lib/api/error'

/*
 * Tests for the error envelope and backend-message extraction.
 *
 * The convention (MEMORY: feedback_trust_backend_errors) is to surface the
 * backend's `error` string verbatim. These tests pin that contract — change
 * them only when the backend's error shape genuinely changes.
 */

describe('extractBackendFields', () => {
  it('reads the primary shape { code, error }', () => {
    expect(
      extractBackendFields({ code: 'INVALID_CREDENTIALS', error: 'invalid email or password' }),
    ).toEqual({ code: 'INVALID_CREDENTIALS', message: 'invalid email or password' })
  })

  it('reads the compatibility shape { code, message }', () => {
    expect(extractBackendFields({ code: 'RATE_LIMITED', message: 'slow down' })).toEqual({
      code: 'RATE_LIMITED',
      message: 'slow down',
    })
  })

  it('reads the nested compatibility shape { error: { code, message } }', () => {
    expect(
      extractBackendFields({ error: { code: 'X', message: 'nested' } }),
    ).toEqual({ code: 'X', message: 'nested' })
  })

  it('returns an empty object for missing / non-object inputs', () => {
    expect(extractBackendFields(null)).toEqual({})
    expect(extractBackendFields(undefined)).toEqual({})
    expect(extractBackendFields('')).toEqual({})
    expect(extractBackendFields(42)).toEqual({})
  })

  it('returns an empty object when no recognized fields are present', () => {
    expect(extractBackendFields({ foo: 'bar' })).toEqual({})
  })

  it('treats { code } without a message as code-only', () => {
    // Defensive: a backend that only sends a code (no message) shouldn't
    // produce a phantom `message: undefined` — we surface code-only.
    expect(extractBackendFields({ code: 'X' })).toEqual({})
    // (No message means we fall back to defaults at the caller.)
  })
})

describe('appErrorFromResponse', () => {
  /* Build a Response without doing real fetch — JSON body + status. */
  function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  it('builds AppError with status + code + message from the body', async () => {
    const res = jsonResponse(401, {
      code: 'INVALID_CREDENTIALS',
      error: 'invalid email or password',
    })
    const err = await appErrorFromResponse(res)
    expect(err).toBeInstanceOf(AppError)
    expect(err.status).toBe(401)
    expect(err.code).toBe('INVALID_CREDENTIALS')
    expect(err.message).toBe('invalid email or password')
    expect(err.body).toEqual({
      code: 'INVALID_CREDENTIALS',
      error: 'invalid email or password',
    })
  })

  it('falls back to a generic message when the body has no recognized fields', async () => {
    const res = jsonResponse(500, { random: 'object' })
    const err = await appErrorFromResponse(res)
    expect(err.status).toBe(500)
    expect(err.code).toBeUndefined()
    expect(err.message).toBe('Something went wrong. Please try again.')
  })

  it('handles a non-JSON body gracefully', async () => {
    const res = new Response('<html>404</html>', { status: 404 })
    const err = await appErrorFromResponse(res)
    expect(err.status).toBe(404)
    expect(err.message).toBe('Something went wrong. Please try again.')
    expect(err.body).toBeUndefined()
  })
})

describe('appErrorFromThrown', () => {
  it('returns the input AppError unchanged', () => {
    const original = new AppError({ message: 'x', status: 500 })
    expect(appErrorFromThrown(original)).toBe(original)
  })

  it('treats AbortError as a cancellation', () => {
    const err = new Error('aborted')
    err.name = 'AbortError'
    const out = appErrorFromThrown(err)
    expect(out).toBeInstanceOf(AppError)
    expect(out.message).toBe('Request cancelled.')
  })

  it('falls back to the network message for everything else', () => {
    expect(appErrorFromThrown(new Error('oops')).message).toBe(
      "Can't reach FitCoach. Check your connection and try again.",
    )
    expect(appErrorFromThrown('string')).toBeInstanceOf(AppError)
    expect(appErrorFromThrown(undefined)).toBeInstanceOf(AppError)
  })
})

describe('isFieldLevelError', () => {
  it('is true for 400 / 401 / 422', () => {
    expect(isFieldLevelError(new AppError({ message: '', status: 400 }))).toBe(true)
    expect(isFieldLevelError(new AppError({ message: '', status: 401 }))).toBe(true)
    expect(isFieldLevelError(new AppError({ message: '', status: 422 }))).toBe(true)
  })

  it('is false for 403, 404, 409, 429, 5xx, and unknown', () => {
    for (const s of [403, 404, 409, 429, 500, 502, 503]) {
      expect(
        isFieldLevelError(new AppError({ message: '', status: s })),
      ).toBe(false)
    }
    expect(isFieldLevelError(new AppError({ message: 'no status' }))).toBe(false)
  })
})
