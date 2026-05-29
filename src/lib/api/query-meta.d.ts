/*
 * TanStack Query meta augmentation.
 *
 * `meta` is a free-form bag attached to a query/mutation that the global
 * cache handlers can read. We use it for per-call opt-outs of the global
 * error toaster (the form-error case — see query-client.ts).
 *
 * Strongly typed via module augmentation rather than `any` so misspellings
 * (`skipToasts`, `skiptoast`) fail at compile time.
 */
import '@tanstack/react-query'

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      /** Suppress the global error toast for this query. */
      skipToast?: boolean
    }
    mutationMeta: {
      /** Suppress the global error toast for this mutation. */
      skipToast?: boolean
    }
  }
}
