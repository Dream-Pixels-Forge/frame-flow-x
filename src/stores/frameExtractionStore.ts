import { create } from 'zustand'
import { FrameExtractionOptions, FrameExtractionResult, ExtractedFrame } from '@/utils/frameExtractor'
import { ProcessingProgress } from '@/types'

interface FrameExtractionState {
  // State
  isExtracting: boolean
  isPaused: boolean
  progress: ProcessingProgress
  frames: ExtractedFrame[]
  error: string | null
  result: FrameExtractionResult | null

  // Actions
  startExtraction: (videoPath: string, options: FrameExtractionOptions) => Promise<void>
  pauseExtraction: () => void
  resumeExtraction: () => void
  cancelExtraction: () => void
  clearFrames: () => void
  setProgress: (progress: Partial<ProcessingProgress>) => void
}

export const useFrameExtractionStore = create<FrameExtractionState>()((set) => {
  let extractor: any = null

  return {
    // Initial state
    isExtracting: false,
    isPaused: false,
    progress: {
      current: 0,
      total: 0,
      percentage: 0,
      status: 'idle',
    },
    frames: [],
    error: null,
    result: null,

    // Actions
    startExtraction: async (_videoPath: string, options: FrameExtractionOptions) => {
      set({
        isExtracting: true,
        isPaused: false,
        error: null,
        frames: [],
        result: null,
        progress: {
          current: 0,
          total: 0,
          percentage: 0,
          status: 'processing',
          message: 'Initializing extraction...',
        },
      })

      try {
        // For MVP, simulate extraction
        const frames: ExtractedFrame[] = []
        const totalFrames = 100

        for (let i = 0; i < totalFrames; i++) {
          set({
            progress: {
              current: i + 1,
              total: totalFrames,
              percentage: ((i + 1) / totalFrames) * 100,
              status: 'processing',
              message: `Extracted ${i + 1}/${totalFrames} frames`,
            },
          })

          await new Promise((resolve) => setTimeout(resolve, 50))

          frames.push({
            id: `frame-${i}`,
            frameNumber: i,
            timestamp: i * (1000 / options.fps),
            data: new Blob(),
            width: options.frameRange?.start || 1920,
            height: options.frameRange?.end || 1080,
            format: options.outputFormat,
            size: 500000,
          })
        }

        const result: FrameExtractionResult = {
          success: true,
          frames,
          duration: totalFrames * 50,
        }

        set({
          frames,
          result,
          isExtracting: false,
          progress: {
            current: totalFrames,
            total: totalFrames,
            percentage: 100,
            status: 'completed',
            message: 'Extraction complete',
          },
        })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Extraction failed',
          isExtracting: false,
          progress: {
            current: 0,
            total: 0,
            percentage: 0,
            status: 'error',
            message: 'Extraction failed',
          },
        })
      }
    },

    pauseExtraction: () => {
      set({ isPaused: true })
      extractor?.pause()
    },

    resumeExtraction: () => {
      set({ isPaused: false })
      extractor?.resume()
    },

    cancelExtraction: () => {
      extractor?.cancel()
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
      set({ frames: [], result: null, progress: {
        current: 0,
        total: 0,
        percentage: 0,
        status: 'idle',
      }})
    },

    setProgress: (progress: Partial<ProcessingProgress>) => {
      set((state) => ({
        progress: { ...state.progress, ...progress },
      }))
    },
  }
})
