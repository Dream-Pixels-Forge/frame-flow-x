import { create } from 'zustand'
import { FrameExtractor, FrameExtractionOptions, FrameExtractionResult, ExtractedFrame } from '@/utils/frameExtractor'
import { ProcessingProgress } from '@/types'

interface FrameExtractionState {
  // State
  isExtracting: boolean
  isPaused: boolean
  isInitialized: boolean
  progress: ProcessingProgress
  frames: ExtractedFrame[]
  error: string | null
  result: FrameExtractionResult | null
  extractor: FrameExtractor | null

  // Actions
  initialize: () => Promise<void>
  startExtraction: (videoFile: File, options: FrameExtractionOptions) => Promise<FrameExtractionResult>
  pauseExtraction: () => void
  resumeExtraction: () => void
  cancelExtraction: () => void
  clearFrames: () => void
  clearError: () => void
  setProgress: (progress: Partial<ProcessingProgress>) => void
  dispose: () => void
}

export const useFrameExtractionStore = create<FrameExtractionState>()((set) => {
  let extractorInstance: FrameExtractor | null = null

  return {
    // Initial state
    isExtracting: false,
    isPaused: false,
    isInitialized: false,
    progress: {
      current: 0,
      total: 0,
      percentage: 0,
      status: 'idle',
    },
    frames: [],
    error: null,
    result: null,
    extractor: null,

    // Actions
    initialize: async () => {
      try {
        set({
          isInitialized: false,
          progress: {
            current: 0,
            total: 100,
            percentage: 0,
            status: 'processing',
            message: 'Initializing FFmpeg...',
          },
        })

        extractorInstance = new FrameExtractor((progress) => {
          set({ progress })
        })

        // Check if FFmpeg.wasm is available
        if (!FrameExtractor.isAvailable()) {
          console.warn('FFmpeg.wasm not available (SharedArrayBuffer not supported). Using fallback method.')
        }

        await extractorInstance.initialize()

        set({
          isInitialized: true,
          extractor: extractorInstance,
          progress: {
            current: 100,
            total: 100,
            percentage: 100,
            status: 'completed',
            message: 'FFmpeg ready',
          },
        })
      } catch (error) {
        console.error('Failed to initialize frame extractor:', error)
        set({
          error: error instanceof Error ? error.message : 'Failed to initialize',
          isInitialized: false,
          progress: {
            current: 0,
            total: 0,
            percentage: 0,
            status: 'error',
            message: 'Initialization failed',
          },
        })
      }
    },

    startExtraction: async (videoFile: File, options: FrameExtractionOptions) => {
      // Validate file
      if (!videoFile) {
        const error = 'No video file provided'
        set({
          error,
          progress: {
            current: 0,
            total: 0,
            percentage: 0,
            status: 'error',
            message: error,
          },
        })
        return {
          success: false,
          frames: [],
          error,
          duration: 0,
        }
      }

      // Validate file type
      if (!videoFile.type.startsWith('video/')) {
        const error = 'Invalid file type. Please provide a video file.'
        set({
          error,
          progress: {
            current: 0,
            total: 0,
            percentage: 0,
            status: 'error',
            message: error,
          },
        })
        return {
          success: false,
          frames: [],
          error,
          duration: 0,
        }
      }

      // Validate file size (max 2GB for FFmpeg.wasm)
      const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
      if (videoFile.size > maxSize) {
        const error = `File size exceeds maximum allowed size (2GB). Your file is ${(videoFile.size / (1024 * 1024 * 1024)).toFixed(2)}GB.`
        set({
          error,
          progress: {
            current: 0,
            total: 0,
            percentage: 0,
            status: 'error',
            message: error,
          },
        })
        return {
          success: false,
          frames: [],
          error,
          duration: 0,
        }
      }

      set({
        isExtracting: true,
        isPaused: false,
        error: null,
        frames: [],
        result: null,
        progress: {
          current: 0,
          total: 100,
          percentage: 0,
          status: 'processing',
          message: 'Starting extraction...',
        },
      })

      try {
        // Create extractor if not already created
        if (!extractorInstance) {
          extractorInstance = new FrameExtractor((progress) => {
            set({ progress })
          })
          await extractorInstance.initialize()
        }

        let result: FrameExtractionResult

        // Try FFmpeg.wasm first, fallback to video element method
        if (FrameExtractor.isAvailable() && extractorInstance.isInitialized()) {
          result = await extractorInstance.extract(videoFile, options)
        } else {
          // Fallback to HTML5 video element method
          set({
            progress: {
              current: 0,
              total: 100,
              percentage: 0,
              status: 'processing',
              message: 'Using fallback extraction method...',
            },
          })
          result = await extractorInstance.extractWithVideoElement(videoFile, options)
        }

        if (!result.success) {
          throw new Error(result.error || 'Extraction failed')
        }

        set({
          frames: result.frames,
          result,
          isExtracting: false,
          isInitialized: true,
          extractor: extractorInstance,
          progress: {
            current: 100,
            total: result.frames.length,
            percentage: 100,
            status: 'completed',
            message: `Extracted ${result.frames.length} frames`,
          },
        })

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Extraction failed'
        
        set({
          error: errorMessage,
          isExtracting: false,
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
          frames: [],
          error: errorMessage,
          duration: 0,
        }
      }
    },

    pauseExtraction: () => {
      set({ isPaused: true })
      extractorInstance?.pause()
    },

    resumeExtraction: () => {
      set({ isPaused: false })
      extractorInstance?.resume()
    },

    cancelExtraction: () => {
      extractorInstance?.cancel()
      set({
        isExtracting: false,
        isPaused: false,
        progress: {
          current: 0,
          total: 0,
          percentage: 0,
          status: 'cancelled',
          message: 'Extraction cancelled',
        },
      })
    },

    clearFrames: () => {
      set({ 
        frames: [], 
        result: null, 
        progress: {
          current: 0,
          total: 0,
          percentage: 0,
          status: 'idle',
        },
        error: null,
      })
    },

    clearError: () => {
      set({ error: null })
    },

    setProgress: (progress: Partial<ProcessingProgress>) => {
      set((state) => ({
        progress: { ...state.progress, ...progress },
      }))
    },

    dispose: () => {
      extractorInstance?.cancel()
      extractorInstance = null
      set({
        extractor: null,
        isInitialized: false,
        isExtracting: false,
        isPaused: false,
        frames: [],
        result: null,
        error: null,
        progress: {
          current: 0,
          total: 0,
          percentage: 0,
          status: 'idle',
        },
      })
    },
  }
})
