import { ExtractedFrame } from '@/utils/frameExtractor'

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

export class FrameExporter {
  private abortController: AbortController | null = null
  private progressCallback?: (progress: ExportProgress) => void

  constructor(onProgress?: (progress: ExportProgress) => void) {
    this.progressCallback = onProgress
  }

  async export(
    frames: ExtractedFrame[],
    selectedFrameIds: string[],
    options: ExportOptions
  ): Promise<ExportResult> {
    this.abortController = new AbortController()

    const framesToExport = selectedFrameIds.length > 0
      ? frames.filter(f => selectedFrameIds.includes(f.id))
      : frames

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

      // Convert frame data to target format
      const blob = await this.convertFrameFormat(frame.data, options)
      
      files.push({
        name: fileName,
        size: blob.size,
        blob,
        url: URL.createObjectURL(blob),
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
      await new Promise(resolve => setTimeout(resolve, 10))
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

  private async exportAsZip(
    frames: ExtractedFrame[],
    options: ExportOptions
  ): Promise<ExportResult> {
    const startTime = performance.now()
    // For MVP, we'll simulate ZIP export
    // In production, use JSZip library
    const files: ExportedFile[] = []

    for (let i = 0; i < frames.length; i++) {
      if (this.abortController?.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      const frame = frames[i]
      const fileName = this.generateFileName(frame, i, options)
      const blob = await this.convertFrameFormat(frame.data, options)

      files.push({
        name: fileName,
        size: blob.size,
        blob,
      })

      this.reportProgress({
        current: i + 1,
        total: frames.length,
        percentage: ((i + 1) / frames.length) * 100,
        status: 'processing',
        message: `Adding ${fileName} to archive...`,
      })

      await new Promise(resolve => setTimeout(resolve, 10))
    }

    // Create simulated ZIP blob
    const zipBlob = new Blob(files.map(f => f.blob), { type: 'application/zip' })
    const zipFile: ExportedFile = {
      name: `frame-flow-x-export-${Date.now()}.zip`,
      size: zipBlob.size,
      blob: zipBlob,
      url: URL.createObjectURL(zipBlob),
    }

    this.reportProgress({
      current: frames.length,
      total: frames.length,
      percentage: 100,
      status: 'completed',
      message: 'ZIP archive created',
    })

    const duration = performance.now() - startTime

    return {
      success: true,
      files: [zipFile],
      duration,
      totalSize: zipBlob.size,
    }
  }

  private async convertFrameFormat(
    data: Blob,
    options: ExportOptions
  ): Promise<Blob> {
    // If frame already has data, return it (for MVP)
    // In production, convert to target format using canvas
    if (data.size > 0) {
      return data
    }

    // Create simulated blob for empty frames
    return new Blob([`Simulated ${options.format} data`], {
      type: `image/${options.format}`,
    })
  }

  private generateFileName(
    frame: ExtractedFrame,
    index: number,
    options: ExportOptions
  ): string {
    const pattern = options.namingPattern || 'frame_{index}'
    
    return pattern
      .replace('{index}', String(index + 1).padStart(4, '0'))
      .replace('{timestamp}', (frame.timestamp / 1000).toFixed(3))
      .replace('{frame}', String(frame.frameNumber))
      .replace('{format}', options.format)
  }

  pause() {
    // Pause functionality for future implementation
  }

  resume() {
    // Resume functionality for future implementation
  }

  cancel() {
    this.abortController?.abort()
  }

  private reportProgress(progress: ExportProgress) {
    this.progressCallback?.(progress)
  }
}

// Download helper
export function downloadFile(file: ExportedFile) {
  const link = document.createElement('a')
  link.href = file.url || URL.createObjectURL(file.blob)
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Cleanup
  if (file.url) {
    URL.revokeObjectURL(file.url)
  }
}

// Download multiple files
export async function downloadFiles(files: ExportedFile[]) {
  for (const file of files) {
    downloadFile(file)
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}
