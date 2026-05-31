/*
 * Vitest setup — loaded once before any test runs.
 *
 * Currently just wires `@testing-library/jest-dom` matchers (toBeInTheDocument,
 * toHaveTextContent, etc.) into Vitest's expect. When we add msw for hook /
 * component tests, the global server lifecycle (beforeAll/afterEach/afterAll)
 * goes here too.
 *
 * Pinned by /plan-eng-review Decision 8A.
 */

import '@testing-library/jest-dom/vitest'
