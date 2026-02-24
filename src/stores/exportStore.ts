import { create } from 'zustand'
import { ExportOptions, ExportProgress, ExportResult, FrameExporter } from '@/utils/frameExporter'
import { ExtractedFrame } from '@/utils/frameExtractor'

interface ExportState {
  // State
  isExporting: boolean
  progress: ExportProgress
  result: ExportResult | null
  options: ExportOptions
  
  // Actions
  startExport: (
    frames: ExtractedFrame[],
    selectedFrameIds: string[],
    options: ExportOptions
  ) => Promise<void>
  cancelExport: () => void
  setOptions: (options: Partial<ExportOptions>) => void
  clearResult: () => void
}

const DEFAULT_OPTIONS: ExportOptions = {
  format: 'png',
  quality: 95,
  namingPattern: 'frame_{index}',
  zipExport: false,
}

export const useExportStore = create<ExportState>()((set) => ({
  // Initial state
  isExporting: false,
  progress: {
    current: 0,
    total: 0,
    percentage: 0,
    status: 'idle',
  },
  result: null,
  options: DEFAULT_OPTIONS,

  // Actions
  startExport: async (frames, selectedFrameIds, options) => {
    set({
      isExporting: true,
      options,
      progress: {
        current: 0,
        total: selectedFrameIds.length || frames.length,
        percentage: 0,
        status: 'processing',
        message: 'Starting export...',
      },
      result: null,
    })

    try {
      const exporter = new FrameExporter((progress) => {
        set({ progress })
      })

      const result = await exporter.export(frames, selectedFrameIds, options)

      set({
        result,
        isExporting: false,
        progress: {
          current: result.success ? result.files.length : 0,
          total: result.success ? result.files.length : 0,
          percentage: result.success ? 100 : 0,
          status: result.success ? 'completed' : 'error',
          message: result.success ? 'Export complete' : result.error,
        },
      })
    } catch (error) {
      set({
        isExporting: false,
        progress: {
          current: 0,
          total: 0,
          percentage: 0,
          status: 'error',
          message: error instanceof Error ? error.message : 'Export failed',
        },
      })
    }
  },

  cancelExport: () => {
    set({
      isExporting: false,
      progress: {
        current: 0,
        total: 0,
        percentage: 0,
        status: 'cancelled',
        message: 'Export cancelled',
      },
    })
  },

  setOptions: (options: Partial<ExportOptions>) => {
    set((state) => ({
      options: { ...state.options, ...options },
    }))
  },

  clearResult: () => {
    set({ result: null })
  },
}))
