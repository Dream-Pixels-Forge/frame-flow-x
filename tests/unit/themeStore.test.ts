import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useThemeStore } from '@/stores/themeStore'

describe('Theme Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useThemeStore.setState({ theme: 'dark', isDark: true })
  })

  it('should initialize with dark theme', () => {
    const state = useThemeStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.isDark).toBe(true)
  })

  it('should toggle theme from dark to light', () => {
    const { toggleTheme } = useThemeStore.getState()
    toggleTheme()
    const state = useThemeStore.getState()
    expect(state.theme).toBe('light')
    expect(state.isDark).toBe(false)
  })

  it('should toggle theme from light to dark', () => {
    useThemeStore.setState({ theme: 'light', isDark: false })
    const { toggleTheme } = useThemeStore.getState()
    toggleTheme()
    const state = useThemeStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.isDark).toBe(true)
  })

  it('should set theme directly', () => {
    const { setTheme } = useThemeStore.getState()
    setTheme('light')
    const state = useThemeStore.getState()
    expect(state.theme).toBe('light')
  })
})
