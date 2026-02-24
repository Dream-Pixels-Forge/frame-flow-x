import { describe, it, expect, beforeEach } from 'vitest'
import { useVideoProcessingStore } from '@/stores/videoProcessingStore'

describe('Video Processing Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useVideoProcessingStore.setState({
      currentVideo: null,
      frames: [],
      selectedFrameIds: [],
      progress: { current: 0, total: 0, percentage: 0, status: 'idle' },
      isProcessing: false,
      isPaused: false,
      upscaleOptions: { scale: 2, quality: 'balanced' },
      enhancementOptions: {
        noiseReduction: 0,
        sharpening: 0,
        brightness: 0,
        contrast: 0,
        saturation: 0,
      },
    })
  })

  it('should initialize with default state', () => {
    const state = useVideoProcessingStore.getState()
    expect(state.currentVideo).toBeNull()
    expect(state.frames).toEqual([])
    expect(state.isProcessing).toBe(false)
  })

  it('should set current video', () => {
    const mockVideo = {
      id: 'test-1',
      name: 'test.mp4',
      path: '/path/test.mp4',
      duration: 120,
      width: 1920,
      height: 1080,
      fps: 30,
      codec: 'h264',
      size: 50000000,
      format: 'mp4',
    }
    const { setCurrentVideo } = useVideoProcessingStore.getState()
    setCurrentVideo(mockVideo)
    const state = useVideoProcessingStore.getState()
    expect(state.currentVideo).toEqual(mockVideo)
  })

  it('should add frames', () => {
    const mockFrames = [
      { id: 'frame-1', path: '/frame1.png', timestamp: 0, frameNumber: 1, width: 1920, height: 1080, format: 'png' as const, size: 1000000 },
      { id: 'frame-2', path: '/frame2.png', timestamp: 1000, frameNumber: 2, width: 1920, height: 1080, format: 'png' as const, size: 1000000 },
    ]
    const { addFrames } = useVideoProcessingStore.getState()
    addFrames(mockFrames)
    const state = useVideoProcessingStore.getState()
    expect(state.frames).toHaveLength(2)
  })

  it('should toggle frame selection', () => {
    const mockFrames = [
      { id: 'frame-1', path: '/frame1.png', timestamp: 0, frameNumber: 1, width: 1920, height: 1080, format: 'png' as const, size: 1000000 },
    ]
    useVideoProcessingStore.getState().addFrames(mockFrames)
    const { toggleFrameSelection } = useVideoProcessingStore.getState()
    
    // Toggle on
    toggleFrameSelection('frame-1')
    let state = useVideoProcessingStore.getState()
    expect(state.selectedFrameIds).toContain('frame-1')
    
    // Toggle off
    toggleFrameSelection('frame-1')
    state = useVideoProcessingStore.getState()
    expect(state.selectedFrameIds).not.toContain('frame-1')
  })

  it('should update processing progress', () => {
    const { setProgress, startProcessing } = useVideoProcessingStore.getState()
    startProcessing()
    setProgress({ current: 50, total: 100, percentage: 50 })
    const state = useVideoProcessingStore.getState()
    expect(state.progress.current).toBe(50)
    expect(state.progress.percentage).toBe(50)
  })

  it('should pause and resume processing', () => {
    const { startProcessing, pauseProcessing, resumeProcessing } = useVideoProcessingStore.getState()
    startProcessing()
    expect(useVideoProcessingStore.getState().isPaused).toBe(false)
    
    pauseProcessing()
    expect(useVideoProcessingStore.getState().isPaused).toBe(true)
    
    resumeProcessing()
    expect(useVideoProcessingStore.getState().isPaused).toBe(false)
  })

  it('should update upscale options', () => {
    const { setUpscaleOptions } = useVideoProcessingStore.getState()
    setUpscaleOptions({ scale: 4, quality: 'quality' })
    const state = useVideoProcessingStore.getState()
    expect(state.upscaleOptions.scale).toBe(4)
    expect(state.upscaleOptions.quality).toBe('quality')
  })
})
