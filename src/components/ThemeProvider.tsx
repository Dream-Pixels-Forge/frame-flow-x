import { HeroUIProvider } from '@heroui/react'
import { useThemeStore } from '@/stores/themeStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useThemeStore()

  return (
    <HeroUIProvider 
      theme={{
        extend: 'auto',
      }}
    >
      <div className={`min-h-screen bg-background text-foreground ${theme === 'dark' ? 'dark' : ''}`}>
        {children}
      </div>
    </HeroUIProvider>
  )
}
