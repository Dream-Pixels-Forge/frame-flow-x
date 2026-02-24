import { create } from 'zustand'
import { ExportOptions, ExportProgress, ExportResult, FrameExporter, downloadExportResult, cleanupExportFiles } from '@/utils/frameExporter'
import { ExtractedFrame } from '@/utils/frameExtractor'

interface ExportState {
  // State
  isExporting: boolean
  isPaused: boolean
  progress: ExportProgress
  result: ExportResult | null
  options: ExportOptions
  error: string | null

  // Actions
  startExport: (
    frames: ExtractedFrame[],
    selectedFrameIds: string[],
    options: ExportOptions
  ) => Promise<ExportResult>
  cancelExport: () => void
  setOptions: (options: Partial<ExportOptions>) => void
  clearResult: () => void
  clearError: () => void
  downloadResult: () => void
  cleanup: () => void
}

const DEFAULT_OPTIONS: ExportOptions = {
  format: 'png',
  quality: 95,
  namingPattern: 'frame_{index}',
  zipExport: false,
}

export const useExportStore = create<ExportState>()((set, get) => ({
  // Initial state
  isExporting: false,
  isPaused: false,
  progress: {
    current: 0,
    total: 0,
    percentage: 0,
    status: 'idle',
  },
  result: null,
  options: DEFAULT_OPTIONS,
  error: null,

  // Actions
  startExport: async (frames, selectedFrameIds, options) => {
    // Validate input
    if (!frames || frames.length === 0) {
      const error = 'No frames to export'
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
        files: [],
        error,
        duration: 0,
        totalSize: 0,
      }
    }

    const framesToExport = selectedFrameIds.length > 0
      ? frames.filter((f) => selectedFrameIds.includes(f.id))
      : frames

    if (framesToExport.length === 0) {
      const error = 'No frames selected for export'
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
        files: [],
        error,
        duration: 0,
        totalSize: 0,
      }
    }

    // Validate options
    if (options.quality < 1 || options.quality > 100) {
      const error = 'Quality must be between 1 and 100'
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
        files: [],
        error,
        duration: 0,
        totalSize: 0,
      }
    }

    set({
      isExporting: true,
      isPaused: false,
      options,
      error: null,
      progress: {
        current: 0,
        total: framesToExport.length,
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

      const result = await exporter.export(framesToExport, selectedFrameIds, options)

      if (!result.success) {
        throw new Error(result.error || 'Export failed')
      }

      set({
        result,
        isExporting: false,
        error: null,
        progress: {
          current: result.success ? result.files.length : 0,
          total: result.success ? result.files.length : 0,
          percentage: result.success ? 100 : 0,
          status: result.success ? 'completed' : 'error',
          message: result.success 
            ? `Export complete: ${result.files.length} file(s), ${formatFileSize(result.totalSize)}`
            : result.error,
        },
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed'
      
      set({
        error: errorMessage,
        isExporting: false,
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
        files: [],
        error: errorMessage,
        duration: 0,
        totalSize: 0,
      }
    }
  },

  cancelExport: () => {
    set({
      isExporting: false,
      isPaused: false,
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
    // Cleanup any object URLs before clearing
    const { result } = get()
    if (result?.files) {
      cleanupExportFiles(result.files)
    }
    set({ result: null })
  },

  clearError: () => {
    set({ error: null })
  },

  downloadResult: () => {
    const { result } = get()
    
    if (!result || !result.success || result.files.length === 0) {
      set({
        error: 'No export result to download',
      })
      return
    }

    try {
      downloadExportResult(result)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Download failed',
      })
    }
  },

  cleanup: () => {
    const { result } = get()
    if (result?.files) {
      cleanupExportFiles(result.files)
    }
    set({
      result: null,
      error: null,
      isExporting: false,
      isPaused: false,
      progress: {
        current: 0,
        total: 0,
        percentage: 0,
        status: 'idle',
      },
    })
  },
}))

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
