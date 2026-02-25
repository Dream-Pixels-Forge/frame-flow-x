import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from './hook'

describe('useMyHook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMyHook())

    expect(result.current.value).toBe('')
    expect(result.current.isReady).toBe(false)
  })

  it('should initialize with provided initial value', () => {
    const { result } = renderHook(() =>
      useMyHook({ initialValue: 'test' })
    )

    expect(result.current.value).toBe('test')
  })

  it('should update value when setValue is called', () => {
    const { result } = renderHook(() => useMyHook())

    act(() => {
      result.current.setValue('new value')
    })

    expect(result.current.value).toBe('new value')
  })

  it('should reset to initial value', () => {
    const { result } = renderHook(() =>
      useMyHook({ initialValue: 'initial' })
    )

    act(() => {
      result.current.setValue('changed')
      result.current.reset()
    })

    expect(result.current.value).toBe('initial')
  })

  it('should call onChange callback when value changes', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useMyHook({ onChange })
    )

    act(() => {
      result.current.setValue('test')
    })

    expect(onChange).toHaveBeenCalledWith('test')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should set isReady to true when enabled', () => {
    const { result } = renderHook(() =>
      useMyHook({ enabled: true })
    )

    // Note: This might need adjustment based on actual hook behavior
    expect(result.current.isReady).toBe(true)
  })
})
