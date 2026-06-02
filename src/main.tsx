import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import './index.css'
import { routeTree } from './routeTree.gen'
import '@/lib/api/client' // side-effect: registers the auth interceptor on the typed fetchClient
import { queryClient } from '@/lib/api/query-client'
import { Toaster } from '@/components/feedback/Toaster'


const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  // Expose the QueryClient on the router context so route loaders can use
  // it for prefetching (Task T5 onward).
  context: { queryClient },
})

// Register the router instance for type safety across the codebase.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found in index.html')

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
)
