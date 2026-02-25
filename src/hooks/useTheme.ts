import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement
    const isDark = selectedTheme === 'dark' || (selectedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const setThemeAndStore = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) {
    return {
      theme: 'system',
      setTheme: setThemeAndStore,
      actualTheme: 'system',
    }
  }

  return {
    theme,
    setTheme: setThemeAndStore,
    actualTheme: theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme,
  }
}
