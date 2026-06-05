import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
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
