interface ToastProviderProps {
  children?: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <div 
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 9999,
        }}
      >
        {/* Toast notifications will be implemented with HeroUI Toast */}
      </div>
    </>
  )
}

export const toast = {
  success: (message: string) => console.log('✓', message),
  error: (message: string) => console.log('✗', message),
  info: (message: string) => console.log('ℹ', message),
}
