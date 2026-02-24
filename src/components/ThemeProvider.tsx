import { HeroUIProvider } from '@heroui/react'
import { useThemeStore } from '@/stores/themeStore'
import { useEffect } from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, isDark } = useThemeStore()

  // Sync theme with document element for HeroUI
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', isDark)
    }
  }, [theme, isDark])

  return (
    <HeroUIProvider>
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </HeroUIProvider>
  )
}
