import { create } from 'zustand'
import { createAIService, AIService, UpscaleOptions, EnhancementOptions, AIProcessingProgress, AIProcessingResult } from '@/services/aiService'

interface AIState {
  // State
  service: AIService | null
  isProcessing: boolean
  isAvailable: boolean
  progress: AIProcessingProgress
  result: AIProcessingResult | null
  
  // Actions
  initialize: () => Promise<void>
  upscale: (image: Blob | string, options: UpscaleOptions) => Promise<AIProcessingResult>
  enhance: (image: Blob | string, options: EnhancementOptions) => Promise<AIProcessingResult>
  cancel: () => void
  setProgress: (progress: Partial<AIProcessingProgress>) => void
}

export const useAIStore = create<AIState>()((set, get) => ({
  // Initial state
  service: null,
  isProcessing: false,
  isAvailable: false,
  progress: {
    current: 0,
    total: 0,
    percentage: 0,
    status: 'idle',
  },
  result: null,

  // Actions
  initialize: async () => {
    const service = createAIService()
    await service.initialize()
    
    set({
      service,
      isAvailable: service.isAvailable(),
    })
  },

  upscale: async (image, options) => {
    const { service } = get()
    if (!service) {
      return {
        success: false,
        error: 'AI service not initialized',
        duration: 0,
      }
    }

    set({
      isProcessing: true,
      progress: {
        current: 0,
        total: 1,
        percentage: 0,
        status: 'processing',
        message: 'Starting AI upscaling...',
      },
      result: null,
    })

    try {
      const result = await service.upscale(image, options)

      set({
        result,
        isProcessing: false,
        progress: {
          current: 1,
          total: 1,
          percentage: 100,
          status: result.success ? 'completed' : 'error',
          message: result.success ? 'Upscaling complete' : result.error,
        },
      })

      return result
    } catch (error) {
      set({
        isProcessing: false,
        progress: {
          current: 0,
          total: 0,
          percentage: 0,
          status: 'error',
          message: error instanceof Error ? error.message : 'Upscaling failed',
        },
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upscaling failed',
        duration: 0,
      }
    }
  },

  enhance: async (image, options) => {
    const { service } = get()
    if (!service) {
      return {
        success: false,
        error: 'AI service not initialized',
        duration: 0,
      }
    }

    set({
      isProcessing: true,
      progress: {
        current: 0,
        total: 1,
        percentage: 0,
        status: 'processing',
        message: 'Applying enhancements...',
      },
      result: null,
    })

    try {
      const result = await service.enhance(image, options)

      set({
        result,
        isProcessing: false,
        progress: {
          current: 1,
          total: 1,
          percentage: 100,
          status: result.success ? 'completed' : 'error',
          message: result.success ? 'Enhancement complete' : result.error,
        },
      })

      return result
    } catch (error) {
      set({
        isProcessing: false,
        progress: {
          current: 0,
          total: 0,
          percentage: 0,
          status: 'error',
          message: error instanceof Error ? error.message : 'Enhancement failed',
        },
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Enhancement failed',
        duration: 0,
      }
    }
  },

  cancel: () => {
    const { service } = get()
    service?.cancel()
    
    set({
      isProcessing: false,
      progress: {
        current: 0,
        total: 0,
        percentage: 0,
        status: 'cancelled',
        message: 'Processing cancelled',
      },
    })
  },

  setProgress: (progress) => {
    set((state) => ({
      progress: { ...state.progress, ...progress },
    }))
  },
}))
