import { HeroUIProvider } from '@heroui/react'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <HeroUIProvider>
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </HeroUIProvider>
  )
}
