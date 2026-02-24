import JSZip from 'jszip'
import { ExtractedFrame } from '@/utils/frameExtractor'
import { convertImageFormat } from '@/utils/imageProcessing'

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp' | 'tiff'
  quality: number
  namingPattern: string
  zipExport: boolean
  resolution?: {
    width: number
    height: number
  }
  outputFolder?: string
}

export interface ExportProgress {
  current: number
  total: number
  percentage: number
  status: 'idle' | 'processing' | 'completed' | 'error' | 'cancelled'
  message?: string
  currentFrame?: string
}

export interface ExportResult {
  success: boolean
  files: ExportedFile[]
  error?: string
  duration: number
  totalSize: number
}

export interface ExportedFile {
  name: string
  size: number
  blob: Blob
  url?: string
}

/**
 * FrameExporter - Handles real file exports with JSZip support
 */
export class FrameExporter {
  private abortController: AbortController | null = null
  private progressCallback?: (progress: ExportProgress) => void

  constructor(onProgress?: (progress: ExportProgress) => void) {
    this.progressCallback = onProgress
  }

  /**
   * Export frames to files or ZIP archive
   */
  async export(
    frames: ExtractedFrame[],
    selectedFrameIds: string[],
    options: ExportOptions
  ): Promise<ExportResult> {
    this.abortController = new AbortController()

    const framesToExport = selectedFrameIds.length > 0
      ? frames.filter((f) => selectedFrameIds.includes(f.id))
      : frames

    if (framesToExport.length === 0) {
      return {
        success: false,
        files: [],
        error: 'No frames to export',
        duration: 0,
        totalSize: 0,
      }
    }

    this.reportProgress({
      current: 0,
      total: framesToExport.length,
      percentage: 0,
      status: 'processing',
      message: 'Starting export...',
    })

    try {
      if (options.zipExport) {
        return await this.exportAsZip(framesToExport, options)
      } else {
        return await this.exportIndividual(framesToExport, options)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          files: [],
          error: 'Export cancelled',
          duration: 0,
          totalSize: 0,
        }
      }
      throw error
    } finally {
      this.abortController = null
    }
  }

  /**
   * Export frames as individual files with download triggers
   */
  private async exportIndividual(
    frames: ExtractedFrame[],
    options: ExportOptions
  ): Promise<ExportResult> {
    const startTime = performance.now()
    const files: ExportedFile[] = []

    for (let i = 0; i < frames.length; i++) {
      if (this.abortController?.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      const frame = frames[i]
      const fileName = this.generateFileName(frame, i, options)

      // Convert frame to target format
      const blob = await this.convertFrameFormat(frame.data, options)

      // Create object URL for download
      const url = URL.createObjectURL(blob)

      files.push({
        name: fileName,
        size: blob.size,
        blob,
        url,
      })

      this.reportProgress({
        current: i + 1,
        total: frames.length,
        percentage: ((i + 1) / frames.length) * 100,
        status: 'processing',
        message: `Exporting ${fileName}...`,
        currentFrame: fileName,
      })

      // Small delay to allow UI updates
      await new Promise((resolve) => setTimeout(resolve, 5))
    }

    this.reportProgress({
      current: frames.length,
      total: frames.length,
      percentage: 100,
      status: 'completed',
      message: 'Export complete',
    })

    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    const duration = performance.now() - startTime

    return {
      success: true,
      files,
      duration,
      totalSize,
    }
  }

  /**
   * Export frames as a ZIP archive using JSZip
   */
  private async exportAsZip(
    frames: ExtractedFrame[],
    options: ExportOptions
  ): Promise<ExportResult> {
    const startTime = performance.now()
    const zip = new JSZip()

    // Create folder if specified
    let rootFolder = zip
    if (options.outputFolder) {
      rootFolder = zip.folder(options.outputFolder) || zip
    }

    for (let i = 0; i < frames.length; i++) {
      if (this.abortController?.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      const frame = frames[i]
      const fileName = this.generateFileName(frame, i, options)

      // Convert frame to target format
      const blob = await this.convertFrameFormat(frame.data, options)

      // Add file to ZIP
      rootFolder.file(fileName, blob)

      this.reportProgress({
        current: i + 1,
        total: frames.length,
        percentage: ((i + 1) / frames.length) * 50, // First 50% for adding files
        status: 'processing',
        message: `Adding ${fileName} to archive...`,
        currentFrame: fileName,
      })
    }

    this.reportProgress({
      current: frames.length,
      total: frames.length,
      percentage: 50,
      status: 'processing',
      message: 'Compressing archive...',
    })

    // Generate ZIP file
    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6, // Balanced compression level
        },
      },
      (metadata) => {
        this.reportProgress({
          current: frames.length,
          total: frames.length,
          percentage: 50 + (metadata.percent / 100) * 50, // Second 50% for compression
          status: 'processing',
          message: `Compressing: ${Math.round(metadata.percent)}%`,
        })
      }
    )

    const zipFileName = `frame-flow-x-export-${Date.now()}.zip`
    const zipUrl = URL.createObjectURL(zipBlob)

    const zipFile: ExportedFile = {
      name: zipFileName,
      size: zipBlob.size,
      blob: zipBlob,
      url: zipUrl,
    }

    this.reportProgress({
      current: frames.length,
      total: frames.length,
      percentage: 100,
      status: 'completed',
      message: `ZIP archive created (${this.formatFileSize(zipBlob.size)})`,
    })

    const duration = performance.now() - startTime

    return {
      success: true,
      files: [zipFile],
      duration,
      totalSize: zipBlob.size,
    }
  }

  /**
   * Convert frame data to target format
   */
  private async convertFrameFormat(
    data: Blob,
    options: ExportOptions
  ): Promise<Blob> {
    // Skip conversion if already in target format and quality is max
    const currentFormat = data.type.split('/')[1] || 'png'
    const targetFormat = options.format === 'tiff' ? 'png' : options.format // TIFF not supported, fallback to PNG

    if (currentFormat === targetFormat && options.quality >= 100) {
      return data
    }

    try {
      // Use canvas-based conversion
      return await convertImageFormat(data, targetFormat, options.quality / 100)
    } catch (error) {
      console.warn('Format conversion failed, returning original:', error)
      return data
    }
  }

  /**
   * Generate file name based on pattern
   */
  private generateFileName(
    frame: ExtractedFrame,
    index: number,
    options: ExportOptions
  ): string {
    const pattern = options.namingPattern || 'frame_{index}'
    const extension = options.format === 'tiff' ? 'png' : options.format

    return (
      pattern
        .replace('{index}', String(index + 1).padStart(4, '0'))
        .replace('{timestamp}', (frame.timestamp / 1000).toFixed(3))
        .replace('{frame}', String(frame.frameNumber))
        .replace('{format}', extension) + `.${extension}`
    )
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  pause(): void {
    // Pause functionality for future implementation
  }

  resume(): void {
    // Resume functionality for future implementation
  }

  cancel(): void {
    this.abortController?.abort()
  }

  private reportProgress(progress: ExportProgress): void {
    this.progressCallback?.(progress)
  }
}

/**
 * Download a single file
 */
export function downloadFile(file: ExportedFile): void {
  const link = document.createElement('a')
  link.href = file.url || URL.createObjectURL(file.blob)
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Schedule URL revocation after download starts
  setTimeout(() => {
    if (file.url) {
      URL.revokeObjectURL(file.url)
    }
  }, 1000)
}

/**
 * Download multiple files sequentially
 */
export async function downloadFiles(
  files: ExportedFile[],
  delayMs: number = 500
): Promise<void> {
  for (const file of files) {
    downloadFile(file)
    // Delay between downloads to avoid browser blocking
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
}

/**
 * Download a ZIP file
 */
export function downloadZip(zipFile: ExportedFile): void {
  downloadFile(zipFile)
}

/**
 * Trigger download for export result
 */
export function downloadExportResult(result: ExportResult): void {
  if (!result.success || result.files.length === 0) {
    console.error('No files to download')
    return
  }

  if (result.files.length === 1) {
    // Single file (likely a ZIP)
    downloadFile(result.files[0])
  } else {
    // Multiple files - download sequentially
    downloadFiles(result.files)
  }
}

/**
 * Clean up object URLs to prevent memory leaks
 */
export function cleanupExportFiles(files: ExportedFile[]): void {
  files.forEach((file) => {
    if (file.url) {
      URL.revokeObjectURL(file.url)
    }
  })
}
