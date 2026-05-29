/*
 * Error envelope (pinned by MEMORY: feedback_trust_backend_errors).
 *
 * The Go backend already returns errors in a user-ready shape:
 *
 *   { "code": "INVALID_CREDENTIALS", "error": "invalid email or password" }
 *
 * Status code is set semantically. `error` is human copy. `code` is the
 * programmatic identifier. The frontend trusts all three.
 *
 * `AppError` is a thin envelope around those four pieces. There is NO
 * frontend message table, NO kind enum that duplicates HTTP semantics —
 * features that need code-aware behavior switch on `err.code` directly.
 *
 * The only place this layer adds copy is fallbacks: when the backend
 * gave us no body at all (network failure, empty 500). Two strings.
 */

const FALLBACK_NETWORK =
  "Can't reach FitCoach. Check your connection and try again."
const FALLBACK_UNKNOWN = 'Something went wrong. Please try again.'

export class AppError extends Error {
  readonly status?: number
  readonly code?: string
  readonly body?: unknown

  constructor(opts: {
    message: string
    status?: number
    code?: string
    body?: unknown
  }) {
    super(opts.message)
    this.name = 'AppError'
    this.status = opts.status
    this.code = opts.code
    this.body = opts.body
  }
}

/**
 * Convert an HTTP failure response into an AppError. Reads the backend's
 * { code, error } body verbatim. Falls back to a generic only when the
 * body is missing or malformed.
 */
export async function appErrorFromResponse(res: Response): Promise<AppError> {
  let body: unknown
  try {
    body = await res.clone().json()
  } catch {
    // Body wasn't JSON (HTML 404, plain text, empty) — fall through to fallback.
  }

  const { message, code } = extractBackendFields(body)
  return new AppError({
    status: res.status,
    code,
    body,
    message: message ?? FALLBACK_UNKNOWN,
  })
}

/**
 * Convert a thrown value (fetch failure, abort, anything unexpected) into
 * an AppError. Used by the global cache handlers in query-client.ts and
 * by hooks that need to normalize an `err` from a mutation's onError.
 */
export function appErrorFromThrown(e: unknown): AppError {
  if (e instanceof AppError) return e
  if (e instanceof Error && e.name === 'AbortError') {
    return new AppError({ message: 'Request cancelled.' })
  }
  return new AppError({ message: FALLBACK_NETWORK })
}

/**
 * Should this error attach to a form field (inline) rather than fire a
 * toast? True for 400 / 401 / 422 — the statuses the backend uses when
 * the input itself is the problem.
 *
 * Forms call this from their mutation's onError to decide where the
 * error goes. Everything else (5xx, 429, 404, etc.) toasts.
 */
export function isFieldLevelError(err: AppError): boolean {
  return err.status === 400 || err.status === 401 || err.status === 422
}

/*
 * Parse the backend's error body. The primary shape is { code, error }.
 * Two compatibility fallbacks accept { message } and { error: { code, message } }
 * — there for shapes that might surface from middleware (rate limiter,
 * reverse-proxy errors). Drop those once we've confirmed they don't appear
 * in production.
 *
 * Exported because the auth-interceptor's error-normalization step reads the
 * thrown body shape directly (hey-api throws the body, not a Response).
 */
export function extractBackendFields(body: unknown): {
  message?: string
  code?: string
} {
  if (!body || typeof body !== 'object') return {}
  const b = body as Record<string, unknown>

  // Primary shape: { code, error } — the Go backend's models.AppError.
  if (typeof b.error === 'string') {
    return {
      message: b.error,
      code: typeof b.code === 'string' ? b.code : undefined,
    }
  }

  // Compatibility: { code, message }
  if (typeof b.message === 'string') {
    return {
      message: b.message,
      code: typeof b.code === 'string' ? b.code : undefined,
    }
  }

  // Compatibility: { error: { code, message } }
  if (b.error && typeof b.error === 'object') {
    const inner = b.error as Record<string, unknown>
    return {
      message:
        typeof inner.message === 'string' ? inner.message : undefined,
      code: typeof inner.code === 'string' ? inner.code : undefined,
    }
  }

  return {}
}
