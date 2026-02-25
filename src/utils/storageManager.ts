/**
 * Storage Manager for Frame Flow X
 * Handles local storage, IndexedDB, and cleanup
 */

export interface StorageQuota {
  used: number
  total: number
  percentage: number
}

export interface StorageStats {
  frameCount: number
  totalSize: number
  oldestFrame?: Date
  newestFrame?: Date
}

/**
 * Check storage quota and availability
 */
export async function checkStorageQuota(): Promise<StorageQuota> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate()
    const used = estimate.usage || 0
    const total = estimate.quota || 0
    const percentage = total > 0 ? (used / total) * 100 : 0

    return {
      used,
      total,
      percentage,
    }
  }

  // Fallback: return unknown
  return {
    used: 0,
    total: 0,
    percentage: 0,
  }
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<StorageStats> {
  try {
    const frameCount = localStorage.getItem('frame_count') || '0'
    const totalSize = parseInt(localStorage.getItem('storage_size') || '0')

    return {
      frameCount: parseInt(frameCount),
      totalSize,
    }
  } catch (error) {
    console.error('Error getting storage stats:', error)
    return {
      frameCount: 0,
      totalSize: 0,
    }
  }
}

/**
 * Clear temporary files and cache
 */
export async function clearTempFiles(): Promise<void> {
  try {
    // Clear IndexedDB temp data
    if (window.indexedDB) {
      const request = indexedDB.deleteDatabase('frame-flow-temp')
      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }

    // Clear localStorage temp items
    const tempKeys = Object.keys(localStorage).filter((key) => key.startsWith('temp_'))
    tempKeys.forEach((key) => localStorage.removeItem(key))

    console.log('Temporary files cleared')
  } catch (error) {
    console.error('Error clearing temp files:', error)
  }
}

/**
 * Save project state to localStorage
 */
export function saveProjectState(projectId: string, state: unknown): void {
  try {
    const key = `project_${projectId}`
    localStorage.setItem(key, JSON.stringify(state))
    localStorage.setItem(`${key}_timestamp`, Date.now().toString())
  } catch (error) {
    console.error('Error saving project state:', error)
    throw new Error('Failed to save project state')
  }
}

/**
 * Load project state from localStorage
 */
export function loadProjectState(projectId: string): unknown {
  try {
    const key = `project_${projectId}`
    const data = localStorage.getItem(key)
    if (!data) return null
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading project state:', error)
    return null
  }
}

/**
 * Delete project state
 */
export function deleteProjectState(projectId: string): void {
  try {
    const key = `project_${projectId}`
    localStorage.removeItem(key)
    localStorage.removeItem(`${key}_timestamp`)
  } catch (error) {
    console.error('Error deleting project state:', error)
  }
}

/**
 * Auto-save with debounce
 */
export function createAutoSave<T>(
  saveFn: (data: T) => void,
  intervalMs: number = 30000
): {
  update: (data: T) => void
  cancel: () => void
  saveNow: () => void
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastData: T | null = null

  const scheduleSave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      if (lastData !== null) {
        saveFn(lastData)
      }
    }, intervalMs)
  }

  return {
    update: (data: T) => {
      lastData = data
      scheduleSave()
    },
    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    },
    saveNow: () => {
      if (lastData !== null) {
        saveFn(lastData)
      }
    },
  }
}

/**
 * Check if storage is running low
 */
export async function isStorageLow(thresholdPercentage: number = 80): Promise<boolean> {
  const quota = await checkStorageQuota()
  return quota.percentage > thresholdPercentage
}

/**
 * Get storage warning message
 */
export async function getStorageWarning(): Promise<string | null> {
  const quota = await checkStorageQuota()

  if (quota.percentage > 95) {
    return 'Storage is almost full (95%). Please export or delete some frames.'
  }

  if (quota.percentage > 80) {
    return 'Storage is running low (80%). Consider exporting or deleting some frames.'
  }

  return null
}

/**
 * Clean up old/corrupted data
 */
export async function cleanupOldData(maxAgeDays: number = 7): Promise<void> {
  try {
    const now = Date.now()
    const maxAge = maxAgeDays * 24 * 60 * 60 * 1000

    // Clean up old project timestamps
    Object.keys(localStorage).forEach((key) => {
      if (key.endsWith('_timestamp')) {
        const timestamp = parseInt(localStorage.getItem(key) || '0')
        if (timestamp > 0 && now - timestamp > maxAge) {
          const projectKey = key.replace('_timestamp', '')
          localStorage.removeItem(key)
          localStorage.removeItem(projectKey)
          console.log(`Cleaned up old project: ${projectKey}`)
        }
      }
    })

    await clearTempFiles()
  } catch (error) {
    console.error('Error cleaning up old data:', error)
  }
}
