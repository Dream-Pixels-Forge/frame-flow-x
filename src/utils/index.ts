export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Re-export from imageProcessing
export {
  applyEnhancements,
  convertImageFormat,
  resizeImage,
  extractFrameFromVideo,
  batchProcessImages,
  getImageMetadata,
} from './imageProcessing'
export type {
  ImageProcessingOptions,
  ImageDimensions,
  ProcessedImage,
} from './imageProcessing'

// Re-export from frameExtractor
export type {
  FrameExtractionOptions,
  FrameExtractionResult,
  ExtractedFrame,
} from './frameExtractor'
export { FrameExtractor, FFmpegFrameExtractor } from './frameExtractor'

// Re-export from frameExporter
export type {
  ExportOptions,
  ExportProgress,
  ExportResult,
  ExportedFile,
} from './frameExporter'
export {
  FrameExporter,
  downloadFile,
  downloadFiles,
  downloadZip,
  downloadExportResult,
  cleanupExportFiles,
} from './frameExporter'
