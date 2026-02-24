import { create } from 'zustand'
import { createAIService, AIService, UpscaleOptions, EnhancementOptions, AIProcessingProgress, AIProcessingResult, validateAIConfig } from '@/services/aiService'

interface AIState {
  // State
  service: AIService | null
  isProcessing: boolean
  isAvailable: boolean
  isInitialized: boolean
  progress: AIProcessingProgress
  result: AIProcessingResult | null
  error: string | null
  configValid: boolean
  configMessage: string

  // Actions
  initialize: () => Promise<void>
  upscale: (image: Blob | string, options: UpscaleOptions) => Promise<AIProcessingResult>
  enhance: (image: Blob | string, options: EnhancementOptions) => Promise<AIProcessingResult>
  cancel: () => void
  setProgress: (progress: Partial<AIProcessingProgress>) => void
  clearError: () => void
  clearResult: () => void
  checkConfig: () => void
}

export const useAIStore = create<AIState>()((set, get) => ({
  // Initial state
  service: null,
  isProcessing: false,
  isAvailable: false,
  isInitialized: false,
  progress: {
    current: 0,
    total: 0,
    percentage: 0,
    status: 'idle',
  },
  result: null,
  error: null,
  configValid: false,
  configMessage: '',

  // Actions
  initialize: async () => {
    // Check configuration first
    const config = validateAIConfig()
    set({
      configValid: config.valid,
      configMessage: config.message,
    })

    try {
      set({
        isInitialized: false,
        progress: {
          current: 0,
          total: 100,
          percentage: 0,
          status: 'processing',
          message: 'Initializing AI service...',
        },
      })

      const service = createAIService((progress) => {
        set({ progress })
      })

      await service.initialize()

      set({
        service,
        isAvailable: service.isAvailable(),
        isInitialized: true,
        error: null,
        progress: {
          current: 100,
          total: 100,
          percentage: 100,
          status: 'completed',
          message: service.isAvailable() 
            ? 'AI service ready (Replicate API)' 
            : 'AI service ready (Simulated)',
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize AI service'
      
      set({
        error: errorMessage,
        isInitialized: false,
        isAvailable: false,
        progress: {
          current: 0,
          total: 0,
          percentage: 0,
          status: 'error',
          message: errorMessage,
        },
      })
    }
  },

  upscale: async (image, options) => {
    const { service } = get()
    
    if (!service) {
      const error = 'AI service not initialized'
      set({ error })
      return {
        success: false,
        error,
        duration: 0,
      }
    }

    // Validate image
    if (!image) {
      const error = 'No image provided'
      set({ error })
      return {
        success: false,
        error,
        duration: 0,
      }
    }

    // Validate options
    if (options.scale !== 2 && options.scale !== 4) {
      const error = 'Scale must be 2 or 4'
      set({ error })
      return {
        success: false,
        error,
        duration: 0,
      }
    }

    set({
      isProcessing: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        percentage: 0,
        status: 'processing',
        message: service.isAvailable() 
          ? 'Starting AI upscaling...' 
          : 'Starting simulated upscaling...',
      },
      result: null,
    })

    try {
      const result = await service.upscale(image, options)

      if (!result.success) {
        throw new Error(result.error || 'Upscaling failed')
      }

      set({
        result,
        isProcessing: false,
        error: null,
        progress: {
          current: 100,
          total: 100,
          percentage: 100,
          status: 'completed',
          message: 'Upscaling complete',
        },
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upscaling failed'
      
      set({
        error: errorMessage,
        isProcessing: false,
        progress: {
          current: 0,
          total: 0,
          percentage: 0,
          status: 'error',
          message: errorMessage,
        },
      })

      return {
        success: false,
        error: errorMessage,
        duration: 0,
      }
    }
  },

  enhance: async (image, options) => {
    const { service } = get()
    
    if (!service) {
      const error = 'AI service not initialized'
      set({ error })
      return {
        success: false,
        error,
        duration: 0,
      }
    }

    // Validate image
    if (!image) {
      const error = 'No image provided'
      set({ error })
      return {
        success: false,
        error,
        duration: 0,
      }
    }

    set({
      isProcessing: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        percentage: 0,
        status: 'processing',
        message: 'Applying enhancements...',
      },
      result: null,
    })

    try {
      const result = await service.enhance(image, options)

      if (!result.success) {
        throw new Error(result.error || 'Enhancement failed')
      }

      set({
        result,
        isProcessing: false,
        error: null,
        progress: {
          current: 100,
          total: 100,
          percentage: 100,
          status: 'completed',
          message: 'Enhancement complete',
        },
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Enhancement failed'
      
      set({
        error: errorMessage,
        isProcessing: false,
        progress: {
          current: 0,
          total: 0,
          percentage: 0,
          status: 'error',
          message: errorMessage,
        },
      })

      return {
        success: false,
        error: errorMessage,
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

  clearError: () => {
    set({ error: null })
  },

  clearResult: () => {
    set({ result: null })
  },

  checkConfig: () => {
    const config = validateAIConfig()
    set({
      configValid: config.valid,
      configMessage: config.message,
    })
  },
}))
