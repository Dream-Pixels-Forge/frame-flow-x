import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StorageState {
  // State
  usedStorage: number
  availableStorage: number
  projectCount: number
  lastBackup: number | null
  
  // Actions
  updateStorageUsage: (used: number, available: number) => void
  incrementProjectCount: () => void
  decrementProjectCount: () => void
  setLastBackup: (timestamp: number) => void
  clearStorage: () => void
}

export const useStorageStore = create<StorageState>()(
  persist(
    (set) => ({
      // Initial state
      usedStorage: 0,
      availableStorage: 0,
      projectCount: 0,
      lastBackup: null,

      // Actions
      updateStorageUsage: (used, available) => {
        set({ usedStorage: used, availableStorage: available })
      },

      incrementProjectCount: () => {
        set((state) => ({ projectCount: state.projectCount + 1 }))
      },

      decrementProjectCount: () => {
        set((state) => ({ projectCount: Math.max(0, state.projectCount - 1) }))
      },

      setLastBackup: (timestamp) => {
        set({ lastBackup: timestamp })
      },

      clearStorage: () => {
        set({
          usedStorage: 0,
          availableStorage: 0,
          projectCount: 0,
          lastBackup: null,
        })
      },
    }),
    {
      name: 'frame-flow-x-storage',
    }
  )
)

// Storage utilities
export async function getStorageInfo(): Promise<{ usage: number; quota: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return { usage: estimate.usage || 0, quota: estimate.quota || 0 }
  }
  return { usage: 0, quota: 0 }
}

export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function getStoragePercentage(used: number, total: number): number {
  if (total === 0) return 0
  return Math.round((used / total) * 100)
}
