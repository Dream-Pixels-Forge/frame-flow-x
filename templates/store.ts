import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MyStoreState {
  /** Example state property */
  items: string[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
}

export interface MyStoreActions {
  /** Add an item to the list */
  addItem: (item: string) => void
  /** Remove an item from the list */
  removeItem: (index: number) => void
  /** Set loading state */
  setLoading: (loading: boolean) => void
  /** Set error message */
  setError: (error: string | null) => void
  /** Reset store to initial state */
  reset: () => void
}

export type MyStore = MyStoreState & MyStoreActions

const initialState: MyStoreState = {
  items: [],
  isLoading: false,
  error: null,
}

/**
 * useMyStore - Zustand store for managing example state
 *
 * @example
 * ```tsx
 * const { items, addItem, isLoading } = useMyStore()
 * ```
 */
export const useMyStore = create<MyStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      addItem: (item) =>
        set((state) => ({ items: [...state.items, item] })),

      removeItem: (index) =>
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: 'my-store', // localStorage key
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
)
