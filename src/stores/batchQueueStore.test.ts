import { describe, it, expect, beforeEach } from 'vitest'
import { useBatchQueueStore, getQueueStats } from '@/stores/batchQueueStore'

describe('useBatchQueueStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBatchQueueStore.setState({
      queue: [],
      isProcessing: false,
      currentItemId: null,
      autoStart: true,
      maxConcurrent: 1,
    })
  })

  const createMockVideo = () => ({
    id: 'test-video-id',
    name: 'test.mp4',
    path: 'blob:test',
    file: new File(['test'], 'test.mp4', { type: 'video/mp4' }),
    duration: 60000,
    width: 1920,
    height: 1080,
    fps: 30,
    codec: 'h264',
    size: 1024 * 1024 * 10, // 10MB
    format: 'mp4',
  })

  it('should initialize with empty queue', () => {
    const state = useBatchQueueStore.getState()

    expect(state.queue).toEqual([])
    expect(state.isProcessing).toBe(false)
    expect(state.currentItemId).toBe(null)
    expect(state.autoStart).toBe(true)
  })

  it('should add item to queue', () => {
    const addToQueue = useBatchQueueStore.getState().addToQueue
    const setAutoStart = useBatchQueueStore.getState().setAutoStart
    const mockVideo = createMockVideo()

    // Disable auto-start for this test
    setAutoStart(false)

    addToQueue(mockVideo)

    const state = useBatchQueueStore.getState()
    expect(state.queue).toHaveLength(1)
    expect(state.queue[0].video).toBe(mockVideo)
    expect(state.queue[0].status).toBe('pending')
  })

  it('should auto-start processing when enabled', () => {
    const addToQueue = useBatchQueueStore.getState().addToQueue
    const mockVideo = createMockVideo()

    addToQueue(mockVideo)

    const state = useBatchQueueStore.getState()
    expect(state.isProcessing).toBe(true)
    expect(state.currentItemId).toBe(state.queue[0].id)
  })

  it('should not auto-start when disabled', () => {
    const setAutoStart = useBatchQueueStore.getState().setAutoStart
    const addToQueue = useBatchQueueStore.getState().addToQueue

    setAutoStart(false)

    const mockVideo = createMockVideo()
    addToQueue(mockVideo)

    const state = useBatchQueueStore.getState()
    expect(state.isProcessing).toBe(false)
    expect(state.currentItemId).toBe(null)
  })

  it('should remove item from queue', () => {
    const addToQueue = useBatchQueueStore.getState().addToQueue
    const removeFromQueue = useBatchQueueStore.getState().removeFromQueue
    const mockVideo = createMockVideo()

    addToQueue(mockVideo)

    const state = useBatchQueueStore.getState()
    const itemId = state.queue[0].id

    removeFromQueue(itemId)

    expect(useBatchQueueStore.getState().queue).toHaveLength(0)
  })

  it('should clear entire queue', () => {
    const addToQueue = useBatchQueueStore.getState().addToQueue
    const clearQueue = useBatchQueueStore.getState().clearQueue

    addToQueue(createMockVideo())
    addToQueue(createMockVideo())
    addToQueue(createMockVideo())

    clearQueue()

    expect(useBatchQueueStore.getState().queue).toHaveLength(0)
  })

  it('should clear only completed items', () => {
    const addToQueue = useBatchQueueStore.getState().addToQueue
    const setItemComplete = useBatchQueueStore.getState().setItemComplete
    const setAutoStart = useBatchQueueStore.getState().setAutoStart
    const clearCompleted = useBatchQueueStore.getState().clearCompleted

    // Disable auto-start
    setAutoStart(false)

    addToQueue(createMockVideo())
    addToQueue(createMockVideo())

    const state = useBatchQueueStore.getState()
    const firstItemId = state.queue[0].id

    // Complete first item
    setItemComplete(firstItemId, 100)

    // Clear completed
    clearCompleted()

    const finalState = useBatchQueueStore.getState()
    expect(finalState.queue).toHaveLength(1)
    expect(finalState.queue[0].status).toBe('pending')
  })

  it('should update item progress', () => {
    const addToQueue = useBatchQueueStore.getState().addToQueue
    const updateItemProgress = useBatchQueueStore.getState().updateItemProgress
    const mockVideo = createMockVideo()

    addToQueue(mockVideo)

    const state = useBatchQueueStore.getState()
    const itemId = state.queue[0].id

    updateItemProgress(itemId, {
      current: 50,
      total: 100,
      percentage: 50,
    })

    const updatedState = useBatchQueueStore.getState()
    expect(updatedState.queue[0].progress.current).toBe(50)
    expect(updatedState.queue[0].progress.percentage).toBe(50)
  })

  it('should mark item as complete', () => {
    const addToQueue = useBatchQueueStore.getState().addToQueue
    const setItemComplete = useBatchQueueStore.getState().setItemComplete
    const mockVideo = createMockVideo()

    addToQueue(mockVideo)

    const state = useBatchQueueStore.getState()
    const itemId = state.queue[0].id

    setItemComplete(itemId, 150)

    const updatedState = useBatchQueueStore.getState()
    expect(updatedState.queue[0].status).toBe('completed')
    expect(updatedState.queue[0].frameCount).toBe(150)
    expect(updatedState.queue[0].progress.percentage).toBe(100)
  })

  it('should mark item as error', () => {
    const addToQueue = useBatchQueueStore.getState().addToQueue
    const setItemError = useBatchQueueStore.getState().setItemError
    const mockVideo = createMockVideo()

    addToQueue(mockVideo)

    const state = useBatchQueueStore.getState()
    const itemId = state.queue[0].id

    setItemError(itemId, 'Test error message')

    const updatedState = useBatchQueueStore.getState()
    expect(updatedState.queue[0].status).toBe('error')
    expect(updatedState.queue[0].error).toBe('Test error message')
  })

  it('should cancel item', () => {
    const addToQueue = useBatchQueueStore.getState().addToQueue
    const cancelItem = useBatchQueueStore.getState().cancelItem
    const mockVideo = createMockVideo()

    addToQueue(mockVideo)

    const state = useBatchQueueStore.getState()
    const itemId = state.queue[0].id

    cancelItem(itemId)

    const updatedState = useBatchQueueStore.getState()
    expect(updatedState.queue[0].status).toBe('cancelled')
  })

  it('should get pending items', () => {
    const addToQueue = useBatchQueueStore.getState().addToQueue
    const getPendingItems = useBatchQueueStore.getState().getPendingItems
    const setAutoStart = useBatchQueueStore.getState().setAutoStart

    // Disable auto-start
    setAutoStart(false)

    addToQueue(createMockVideo())
    addToQueue(createMockVideo())

    const pending = getPendingItems()
    expect(pending).toHaveLength(2)
  })

  it('should get next pending item', () => {
    const addToQueue = useBatchQueueStore.getState().addToQueue
    const getNextPendingItem = useBatchQueueStore.getState().getNextPendingItem
    const setAutoStart = useBatchQueueStore.getState().setAutoStart

    // Disable auto-start
    setAutoStart(false)

    const video1 = createMockVideo()
    const video2 = createMockVideo()

    addToQueue(video1)
    addToQueue(video2)

    const next = getNextPendingItem()
    expect(next).not.toBe(null)
    expect(next?.video).toEqual(video1)
  })
})

describe('getQueueStats', () => {
  const createMockItem = (status: 'pending' | 'processing' | 'completed' | 'error' | 'cancelled', frameCount?: number) => ({
    id: 'test-id',
    video: {
      id: 'video-id',
      name: 'test.mp4',
      path: 'test',
      duration: 60000,
      width: 1920,
      height: 1080,
      fps: 30,
      codec: 'h264',
      size: 1024 * 1024,
      format: 'mp4',
    },
    status,
    progress: { current: 0, total: 0, percentage: 0, status: 'idle' as const },
    addedAt: Date.now(),
    frameCount,
  })

  it('should calculate queue statistics', () => {
    const queue = [
      createMockItem('pending'),
      createMockItem('pending'),
      createMockItem('processing'),
      createMockItem('completed', 100),
      createMockItem('completed', 50),
      createMockItem('error'),
    ]

    const stats = getQueueStats(queue)

    expect(stats.total).toBe(6)
    expect(stats.pending).toBe(2)
    expect(stats.processing).toBe(1)
    expect(stats.completed).toBe(2)
    expect(stats.failed).toBe(1)
    expect(stats.totalFrames).toBe(150)
  })

  it('should handle empty queue', () => {
    const stats = getQueueStats([])

    expect(stats.total).toBe(0)
    expect(stats.pending).toBe(0)
    expect(stats.completed).toBe(0)
  })
})
