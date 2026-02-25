import { useState, useEffect, useCallback } from 'react'

export interface UseMyHookOptions {
  /** Initial value for the hook */
  initialValue?: string
  /** Enable/disable feature */
  enabled?: boolean
  /** Callback on value change */
  onChange?: (value: string) => void
}

export interface UseMyHookReturn {
  /** Current value */
  value: string
  /** Update the value */
  setValue: (value: string) => void
  /** Reset to initial value */
  reset: () => void
  /** Whether the hook is ready */
  isReady: boolean
}

/**
 * useMyHook - Custom hook for example functionality
 *
 * @param options - Hook configuration options
 * @returns Hook state and actions
 *
 * @example
 * ```tsx
 * const { value, setValue, reset } = useMyHook({ initialValue: 'test' })
 * ```
 */
export function useMyHook(options: UseMyHookOptions = {}): UseMyHookReturn {
  const {
    initialValue = '',
    enabled = true,
    onChange,
  } = options

  const [value, setValue] = useState<string>(initialValue)
  const [isReady, setIsReady] = useState<boolean>(false)

  // Initialize
  useEffect(() => {
    if (enabled) {
      // Perform any setup here
      setIsReady(true)
    }
  }, [enabled])

  // Callback wrapper
  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue)
      onChange?.(newValue)
    },
    [onChange]
  )

  // Reset function
  const reset = useCallback(() => {
    setValue(initialValue)
  }, [initialValue])

  return {
    value,
    setValue: handleChange,
    reset,
    isReady,
  }
}
