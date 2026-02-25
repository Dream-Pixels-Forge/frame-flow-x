import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<string>(defaultTheme)

  React.useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey)
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else if (defaultTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setTheme(systemTheme)
      applyTheme(systemTheme)
    } else {
      applyTheme(defaultTheme)
    }
  }, [defaultTheme, storageKey])

  const applyTheme = (selectedTheme: string) => {
    const root = document.documentElement
    if (disableTransitionOnChange) {
      root.classList.add('[&_*]:!transition-none')
      window.setTimeout(() => root.classList.remove('[&_*]:!transition-none'), 0)
    }
    
    if (attribute === 'class') {
      if (selectedTheme === 'dark' || (selectedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  return (
    <div className={cn(theme === 'dark' ? 'dark' : '')} {...props}>
      {children}
    </div>
  )
}

export { useTheme } from '@/hooks/useTheme'
