import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/*
 * React-testing helpers.
 *
 * `createTestQueryClient` — fresh QueryClient per test (zero retries, no
 * gcTime so cache doesn't bleed between tests). Tests that share a client
 * across hooks call this once in beforeEach.
 *
 * `withQueryClient` — small Provider wrapper for `renderHook` / `render`.
 * Usage:
 *   const queryClient = createTestQueryClient()
 *   const { result } = renderHook(() => useMyHook(), {
 *     wrapper: withQueryClient(queryClient),
 *   })
 */

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // Don't tail-keep cache entries between tests.
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export function withQueryClient(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}
