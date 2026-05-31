/*
 * Vitest setup — loaded once before any test runs.
 *
 * Wires:
 *   - `@testing-library/jest-dom` matchers (toBeInTheDocument, etc.)
 *   - MSW node server lifecycle (listen → reset after each test → close at end)
 *
 * onUnhandledRequest: 'error' makes any test that hits an un-mocked URL fail
 * loudly rather than silently 404 — keeps the spine honest.
 *
 * Pinned by /plan-eng-review Decision 8A.
 */

import '@testing-library/jest-dom/vitest'

import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from '@/test/msw/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
