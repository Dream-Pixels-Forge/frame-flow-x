import { create } from 'zustand'
import { VideoFile } from '@/types/video'
import { ProcessingProgress } from '@/types'

export interface BatchQueueItem {
  id: string
  video: VideoFile
  status: 'pending' | 'processing' | 'completed' | 'error' | 'cancelled'
  progress: ProcessingProgress
  error?: string
  frameCount?: number
  addedAt: number
  startedAt?: number
  completedAt?: number
}

export interface BatchQueueState {
  // Queue state
  queue: BatchQueueItem[]
  isProcessing: boolean
  currentItemId: string | null
  autoStart: boolean
  maxConcurrent: number

  // Actions
  addToQueue: (video: VideoFile) => void
  removeFromQueue: (itemId: string) => void
  clearQueue: () => void
  clearCompleted: () => void

  // Queue management
  startProcessing: (itemId: string) => void
  pauseProcessing: () => void
  resumeProcessing: () => void
  cancelItem: (itemId: string) => void
  cancelAll: () => void

  // Progress updates
  updateItemProgress: (itemId: string, progress: Partial<ProcessingProgress>) => void
  setItemComplete: (itemId: string, frameCount: number) => void
  setItemError: (itemId: string, error: string) => void

  // Settings
  setAutoStart: (autoStart: boolean) => void
  setMaxConcurrent: (max: number) => void

  // Getters
  getPendingItems: () => BatchQueueItem[]
  getProcessingItems: () => BatchQueueItem[]
  getCompletedItems: () => BatchQueueItem[]
  getFailedItems: () => BatchQueueItem[]
  getNextPendingItem: () => BatchQueueItem | null
}

const createQueueItem = (video: VideoFile): BatchQueueItem => ({
  id: crypto.randomUUID(),
  video,
  status: 'pending',
  progress: {
    current: 0,
    total: 0,
    percentage: 0,
    status: 'idle',
  },
  addedAt: Date.now(),
})

export const useBatchQueueStore = create<BatchQueueState>()((set, get) => ({
  // Initial state
  queue: [],
  isProcessing: false,
  currentItemId: null,
  autoStart: true,
  maxConcurrent: 1,

  // Actions
  addToQueue: (video) => {
    const newItem = createQueueItem(video)
    set((state) => ({
      queue: [...state.queue, newItem],
    }))

    // Auto-start if enabled and nothing else is processing
    const state = get()
    if (state.autoStart && !state.isProcessing) {
      get().startProcessing(newItem.id)
    }
  },

  removeFromQueue: (itemId) => {
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== itemId),
    }))
  },

  clearQueue: () => {
    get().cancelAll()
    set({ queue: [] })
  },

  clearCompleted: () => {
    set((state) => ({
      queue: state.queue.filter(
        (item) => item.status !== 'completed' && item.status !== 'error'
      ),
    }))
  },

  // Queue management
  startProcessing: (itemId) => {
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'processing' as const,
              startedAt: Date.now(),
              progress: {
                ...item.progress,
                status: 'processing' as const,
                current: 0,
                percentage: 0,
              },
            }
          : item
      ),
      isProcessing: true,
      currentItemId: itemId,
    }))
  },

  pauseProcessing: () => {
    set((state) => ({
      isProcessing: false,
      queue: state.queue.map((item) =>
        item.status === 'processing'
          ? { ...item, status: 'pending' as const }
          : item
      ),
    }))
  },

  resumeProcessing: () => {
    const pendingItem = get().getNextPendingItem()
    if (pendingItem) {
      get().startProcessing(pendingItem.id)
    }
  },

  cancelItem: (itemId) => {
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'cancelled' as const,
              progress: {
                ...item.progress,
                status: 'cancelled' as const,
              },
            }
          : item
      ),
      currentItemId: state.currentItemId === itemId ? null : state.currentItemId,
      isProcessing: state.currentItemId === itemId ? false : state.isProcessing,
    }))

    // Auto-start next item if enabled
    if (get().autoStart) {
      get().resumeProcessing()
    }
  },

  cancelAll: () => {
    set((state) => ({
      isProcessing: false,
      currentItemId: null,
      queue: state.queue.map((item) =>
        item.status === 'pending' || item.status === 'processing'
          ? {
              ...item,
              status: 'cancelled' as const,
              progress: {
                ...item.progress,
                status: 'cancelled' as const,
              },
            }
          : item
      ),
    }))
  },

  // Progress updates
  updateItemProgress: (itemId, progress) => {
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === itemId
          ? { ...item, progress: { ...item.progress, ...progress } }
          : item
      ),
    }))
  },

  setItemComplete: (itemId, frameCount) => {
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'completed' as const,
              frameCount,
              completedAt: Date.now(),
              progress: {
                current: frameCount,
                total: frameCount,
                percentage: 100,
                status: 'completed' as const,
                message: `Extracted ${frameCount} frames`,
              },
            }
          : item
      ),
      isProcessing: false,
      currentItemId: null,
    }))

    // Auto-start next item if enabled
    if (get().autoStart) {
      get().resumeProcessing()
    }
  },

  setItemError: (itemId, error) => {
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'error' as const,
              error,
              completedAt: Date.now(),
              progress: {
                ...item.progress,
                status: 'error' as const,
                message: error,
              },
            }
          : item
      ),
      isProcessing: false,
      currentItemId: null,
    }))

    // Auto-start next item if enabled
    if (get().autoStart) {
      get().resumeProcessing()
    }
  },

  // Settings
  setAutoStart: (autoStart) => set({ autoStart }),

  setMaxConcurrent: (max) => set({ maxConcurrent: Math.max(1, max) }),

  // Getters
  getPendingItems: () => {
    return get().queue.filter((item) => item.status === 'pending')
  },

  getProcessingItems: () => {
    return get().queue.filter((item) => item.status === 'processing')
  },

  getCompletedItems: () => {
    return get().queue.filter((item) => item.status === 'completed')
  },

  getFailedItems: () => {
    return get().queue.filter(
      (item) => item.status === 'error' || item.status === 'cancelled'
    )
  },

  getNextPendingItem: () => {
    const pending = get().getPendingItems()
    return pending.length > 0 ? pending[0] : null
  },
}))

/**
 * Calculate total queue statistics
 */
export function getQueueStats(queue: BatchQueueItem[]) {
  return {
    total: queue.length,
    pending: queue.filter((i) => i.status === 'pending').length,
    processing: queue.filter((i) => i.status === 'processing').length,
    completed: queue.filter((i) => i.status === 'completed').length,
    failed: queue.filter((i) => i.status === 'error' || i.status === 'cancelled').length,
    totalFrames: queue
      .filter((i) => i.status === 'completed')
      .reduce((sum, i) => sum + (i.frameCount || 0), 0),
  }
}
