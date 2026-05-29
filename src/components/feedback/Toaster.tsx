import { Toaster as SonnerToaster } from 'sonner'

/*
 * Branded Toaster wrapper.
 *
 * Sonner is the global toast surface for the portal. The interceptor and
 * the QueryClient global onError both call `toast.error(...)` from sonner;
 * those land here.
 *
 * Brand alignment (Decision 7A):
 *   - position bottom-center on mobile (above the bottom nav, easy to dismiss
 *     with thumb)
 *   - richColors uses sonner's built-in palette but our globals.css `.dark`
 *     tokens take precedence for dark mode (v1.1 — wired but not toggled)
 *   - duration 4500ms — long enough to read on a phone, not annoying
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      richColors
      closeButton
      duration={4500}
      offset={88}
      toastOptions={{
        style: {
          fontFamily:
            "'Inter', system-ui, -apple-system, sans-serif",
          borderRadius: '14px',
        },
      }}
    />
  )
}
