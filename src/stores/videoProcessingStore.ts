import { create } from 'zustand'
import { ProcessingProgress, VideoFile, Frame, UpscaleOptions, EnhancementOptions } from '@/types'

interface VideoProcessingState {
  // Video state
  currentVideo: VideoFile | null
  frames: Frame[]
  selectedFrameIds: string[]
  
  // Processing state
  progress: ProcessingProgress
  isProcessing: boolean
  isPaused: boolean
  
  // Upscaling state
  upscaleOptions: UpscaleOptions
  enhancementOptions: EnhancementOptions
  
  // Actions
  setCurrentVideo: (video: VideoFile) => void
  clearVideo: () => void
  addFrames: (frames: Frame[]) => void
  clearFrames: () => void
  toggleFrameSelection: (frameId: string) => void
  selectAllFrames: () => void
  clearSelection: () => void
  
  // Processing actions
  setProgress: (progress: Partial<ProcessingProgress>) => void
  startProcessing: () => void
  completeProcessing: () => void
  pauseProcessing: () => void
  resumeProcessing: () => void
  cancelProcessing: () => void
  
  // Options
  setUpscaleOptions: (options: Partial<UpscaleOptions>) => void
  setEnhancementOptions: (options: Partial<EnhancementOptions>) => void
}

const initialProgress: ProcessingProgress = {
  current: 0,
  total: 0,
  percentage: 0,
  status: 'idle',
}

const defaultUpscaleOptions: UpscaleOptions = {
  scale: 2,
  quality: 'balanced',
}

const defaultEnhancementOptions: EnhancementOptions = {
  noiseReduction: 0,
  sharpening: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
}

export const useVideoProcessingStore = create<VideoProcessingState>()((set, get) => ({
  // Initial state
  currentVideo: null,
  frames: [],
  selectedFrameIds: [],
  progress: initialProgress,
  isProcessing: false,
  isPaused: false,
  upscaleOptions: defaultUpscaleOptions,
  enhancementOptions: defaultEnhancementOptions,
  
  // Video actions
  setCurrentVideo: (video) => set({ currentVideo: video, progress: initialProgress }),
  clearVideo: () => set({ 
    currentVideo: null, 
    frames: [], 
    selectedFrameIds: [],
    progress: initialProgress 
  }),
  addFrames: (frames) => set((state) => ({ frames: [...state.frames, ...frames] })),
  clearFrames: () => set({ frames: [], selectedFrameIds: [], progress: initialProgress }),
  toggleFrameSelection: (frameId) => set((state) => ({
    selectedFrameIds: state.selectedFrameIds.includes(frameId)
      ? state.selectedFrameIds.filter(id => id !== frameId)
      : [...state.selectedFrameIds, frameId]
  })),
  selectAllFrames: () => set((state) => ({ selectedFrameIds: state.frames.map(f => f.id) })),
  clearSelection: () => set({ selectedFrameIds: [] }),
  
  // Processing actions
  setProgress: (progress) => set((state) => ({ 
    progress: { ...state.progress, ...progress }
  })),
  startProcessing: () => set({ isProcessing: true, isPaused: false }),
  completeProcessing: () => set({ 
    isProcessing: false, 
    isPaused: false, 
    progress: { ...get().progress, status: 'completed' }
  }),
  pauseProcessing: () => set({ isPaused: true }),
  resumeProcessing: () => set({ isPaused: false }),
  cancelProcessing: () => set({ 
    isProcessing: false, 
    isPaused: false, 
    progress: { ...get().progress, status: 'cancelled' }
  }),
  
  // Options
  setUpscaleOptions: (options) => set((state) => ({ 
    upscaleOptions: { ...state.upscaleOptions, ...options }
  })),
  setEnhancementOptions: (options) => set((state) => ({ 
    enhancementOptions: { ...state.enhancementOptions, ...options }
  })),
}))
