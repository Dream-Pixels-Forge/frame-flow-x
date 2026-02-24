import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { ProcessingProgress } from '@/types'

export interface FrameExtractionOptions {
  fps: number
  outputFormat: 'png' | 'jpeg' | 'webp'
  quality: number
  frameRange?: {
    start: number
    end: number
  }
}

export interface FrameExtractionResult {
  success: boolean
  frames: ExtractedFrame[]
  error?: string
  duration: number
}

export interface ExtractedFrame {
  id: string
  frameNumber: number
  timestamp: number
  data: Blob
  width: number
  height: number
  format: string
  size: number
}

/**
 * FFmpeg.wasm-based frame extractor for real video frame extraction
 */
export class FrameExtractor {
  private ffmpeg: FFmpeg | null = null
  private abortController: AbortController | null = null
  private isPaused = false
  private progressCallback?: (progress: ProcessingProgress) => void
  private initialized = false
  private initializationPromise: Promise<void> | null = null

  constructor(onProgress?: (progress: ProcessingProgress) => void) {
    this.progressCallback = onProgress
  }

  /**
   * Initialize FFmpeg.wasm
   */
  async initialize(): Promise<void> {
    if (this.initialized) return
    if (this.initializationPromise) return this.initializationPromise

    this.initializationPromise = this.doInitialize()
    return this.initializationPromise
  }

  private async doInitialize(): Promise<void> {
    try {
      this.ffmpeg = new FFmpeg()

      // Set up logging
      this.ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message)
      })

      // Set up progress tracking
      this.ffmpeg.on('progress', ({ progress }) => {
        this.reportProgress({
          current: Math.floor(progress * 100),
          total: 100,
          percentage: progress * 100,
          status: 'processing',
          message: `Processing: ${Math.round(progress * 100)}%`,
        })
      })

      // Load FFmpeg.wasm from CDN
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
      
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      this.initialized = true
      this.reportProgress({
        current: 100,
        total: 100,
        percentage: 100,
        status: 'completed',
        message: 'FFmpeg initialized',
      })
    } catch (error) {
      this.initialized = false
      this.initializationPromise = null
      throw new Error(`Failed to initialize FFmpeg: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Extract frames from a video file
   */
  async extract(
    videoFile: File,
    options: FrameExtractionOptions
  ): Promise<FrameExtractionResult> {
    this.abortController = new AbortController()

    try {
      // Initialize FFmpeg if not already done
      await this.initialize()

      if (!this.ffmpeg) {
        throw new Error('FFmpeg not initialized')
      }

      const startTime = performance.now()

      this.reportProgress({
        current: 0,
        total: 100,
        percentage: 0,
        status: 'processing',
        message: 'Loading video file...',
      })

      // Write video file to FFmpeg's virtual file system
      const videoData = await fetchFile(videoFile)
      const inputFileName = `input.${videoFile.name.split('.').pop() || 'mp4'}`
      await this.ffmpeg.writeFile(inputFileName, videoData)

      this.reportProgress({
        current: 10,
        total: 100,
        percentage: 10,
        status: 'processing',
        message: 'Extracting frames...',
      })

      // Build FFmpeg command for frame extraction
      const outputFormat = options.outputFormat
      const fps = options.fps
      const framePattern = `frame_%06d.${outputFormat}`

      // FFmpeg command: extract frames at specified FPS
      let args = ['-i', inputFileName]

      // Add frame range if specified
      if (options.frameRange) {
        const startFrame = options.frameRange.start
        const endFrame = options.frameRange.end
        args.push('-vf', `select='between(n,${startFrame},${endFrame})'`, '-vsync', 'vfr')
      } else {
        // Extract at specified FPS
        args.push('-vf', `fps=${fps}`)
      }

      // Add quality settings for JPEG/WebP
      if (outputFormat === 'jpeg' || outputFormat === 'webp') {
        args.push('-q:v', options.quality.toString())
      }

      args.push(framePattern)

      // Execute FFmpeg command
      await this.ffmpeg.exec(args)

      this.reportProgress({
        current: 80,
        total: 100,
        percentage: 80,
        status: 'processing',
        message: 'Reading extracted frames...',
      })

      // Read extracted frames from virtual file system
      const frames: ExtractedFrame[] = []
      const dir = await this.ffmpeg.listDir('/')
      
      // Filter frame files
      const frameFiles = dir
        .filter((entry) => entry.name.startsWith('frame_') && entry.name.endsWith(`.${outputFormat}`))
        .sort((a, b) => a.name.localeCompare(b.name))

      for (let i = 0; i < frameFiles.length; i++) {
        if (this.abortController?.signal.aborted) {
          throw new DOMException('Aborted', 'AbortError')
        }

        while (this.isPaused) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        const fileName = frameFiles[i].name
        const fileData = await this.ffmpeg.readFile(fileName) as Uint8Array

        // Create blob from frame data - create a fresh copy to avoid SharedArrayBuffer issues
        const copiedData = new Uint8Array(fileData.length)
        copiedData.set(fileData)
        const blob = new Blob([copiedData], { type: `image/${outputFormat}` })

        const frame: ExtractedFrame = {
          id: `frame-${i}`,
          frameNumber: i,
          timestamp: (i / fps) * 1000, // Approximate timestamp
          data: blob,
          width: 0, // Will be determined from video metadata
          height: 0,
          format: outputFormat,
          size: blob.size,
        }

        frames.push(frame)

        this.reportProgress({
          current: 80 + Math.floor((i / frameFiles.length) * 20),
          total: 100,
          percentage: 80 + ((i / frameFiles.length) * 20),
          status: 'processing',
          message: `Extracted ${i + 1}/${frameFiles.length} frames`,
        })

        // Clean up individual frame file
        try {
          await this.ffmpeg.deleteFile(fileName)
        } catch {
          // Ignore cleanup errors
        }
      }

      // Clean up input file
      try {
        await this.ffmpeg.deleteFile(inputFileName)
      } catch {
        // Ignore cleanup errors
      }

      // Get video metadata for frame dimensions
      const dimensions = await this.getVideoDimensions(videoFile)
      frames.forEach((frame) => {
        frame.width = dimensions.width
        frame.height = dimensions.height
      })

      this.reportProgress({
        current: 100,
        total: 100,
        percentage: 100,
        status: 'completed',
        message: `Extraction complete: ${frames.length} frames`,
      })

      return {
        success: true,
        frames,
        duration: performance.now() - startTime,
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          frames: [],
          error: 'Extraction cancelled',
          duration: 0,
        }
      }

      console.error('Frame extraction error:', error)

      return {
        success: false,
        frames: [],
        error: error instanceof Error ? error.message : 'Extraction failed',
        duration: 0,
      }
    } finally {
      this.abortController = null
    }
  }

  /**
   * Get video dimensions using HTML5 video element
   */
  private async getVideoDimensions(videoFile: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = URL.createObjectURL(videoFile)

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
        })
      }

      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        resolve({ width: 1920, height: 1080 }) // Default fallback
      }
    })
  }

  /**
   * Alternative extraction method using HTML5 video for simpler use cases
   * This is a fallback when FFmpeg.wasm is not available or fails
   */
  async extractWithVideoElement(
    videoFile: File,
    options: FrameExtractionOptions
  ): Promise<FrameExtractionResult> {
    this.abortController = new AbortController()
    const startTime = performance.now()

    try {
      this.reportProgress({
        current: 0,
        total: 100,
        percentage: 0,
        status: 'processing',
        message: 'Loading video...',
      })

      const video = document.createElement('video')
      video.preload = 'auto'
      video.src = URL.createObjectURL(videoFile)
      video.muted = true

      // Wait for video to load
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve()
        video.onerror = () => reject(new Error('Failed to load video'))
      })

      const duration = video.duration * 1000 // ms
      const fps = options.fps
      const totalFrames = Math.floor((duration / 1000) * fps)

      this.reportProgress({
        current: 10,
        total: 100,
        percentage: 10,
        status: 'processing',
        message: `Extracting ${totalFrames} frames...`,
      })

      const frames: ExtractedFrame[] = []
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      // Extract frames at specified intervals
      const frameInterval = 1000 / fps // ms between frames

      for (let i = 0; i < totalFrames; i++) {
        if (this.abortController?.signal.aborted) {
          throw new DOMException('Aborted', 'AbortError')
        }

        while (this.isPaused) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        const timestamp = i * frameInterval
        video.currentTime = timestamp / 1000

        // Wait for seek to complete
        await new Promise<void>((resolve) => {
          const handleSeeked = () => {
            video.removeEventListener('seeked', handleSeeked)
            resolve()
          }
          video.addEventListener('seeked', handleSeeked)
        })

        // Draw frame to canvas
        ctx.drawImage(video, 0, 0)

        // Convert to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
            },
            `image/${options.outputFormat}`,
            options.quality / 100
          )
        })

        const frame: ExtractedFrame = {
          id: `frame-${i}`,
          frameNumber: i,
          timestamp,
          data: blob,
          width: video.videoWidth,
          height: video.videoHeight,
          format: options.outputFormat,
          size: blob.size,
        }

        frames.push(frame)

        this.reportProgress({
          current: 10 + Math.floor(((i + 1) / totalFrames) * 90),
          total: 100,
          percentage: 10 + (((i + 1) / totalFrames) * 90),
          status: 'processing',
          message: `Extracted ${i + 1}/${totalFrames} frames`,
        })
      }

      URL.revokeObjectURL(video.src)

      this.reportProgress({
        current: 100,
        total: 100,
        percentage: 100,
        status: 'completed',
        message: `Extraction complete: ${frames.length} frames`,
      })

      return {
        success: true,
        frames,
        duration: performance.now() - startTime,
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          frames: [],
          error: 'Extraction cancelled',
          duration: 0,
        }
      }

      return {
        success: false,
        frames: [],
        error: error instanceof Error ? error.message : 'Extraction failed',
        duration: 0,
      }
    } finally {
      this.abortController = null
    }
  }

  pause(): void {
    this.isPaused = true
    this.reportProgress({
      current: 0,
      total: 0,
      percentage: 0,
      status: 'paused',
      message: 'Extraction paused',
    })
  }

  resume(): void {
    this.isPaused = false
    this.reportProgress({
      current: 0,
      total: 0,
      percentage: 0,
      status: 'processing',
      message: 'Extraction resumed',
    })
  }

  cancel(): void {
    this.abortController?.abort()
  }

  /**
   * Check if FFmpeg.wasm is available
   */
  static isAvailable(): boolean {
    // Check for SharedArrayBuffer support (required for FFmpeg.wasm)
    return typeof SharedArrayBuffer !== 'undefined'
  }

  /**
   * Get initialization status
   */
  isInitialized(): boolean {
    return this.initialized
  }

  private reportProgress(progress: ProcessingProgress): void {
    this.progressCallback?.(progress)
  }
}

/**
 * Legacy FFmpegFrameExtractor class (kept for compatibility)
 * Now uses the main FrameExtractor class
 */
export class FFmpegFrameExtractor {
  private extractor: FrameExtractor

  constructor(onProgress?: (progress: ProcessingProgress) => void) {
    this.extractor = new FrameExtractor(onProgress)
  }

  async extractFrames(
    videoFile: File,
    fps: number = 1,
    outputFormat: string = 'png'
  ): Promise<Blob[]> {
    const result = await this.extractor.extract(videoFile, {
      fps,
      outputFormat: outputFormat as 'png' | 'jpeg' | 'webp',
      quality: 95,
    })

    if (!result.success) {
      throw new Error(result.error || 'Frame extraction failed')
    }

    return result.frames.map((frame) => frame.data)
  }
}
