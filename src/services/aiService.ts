/**
 * AI Service for image upscaling and enhancement
 * 
 * Supports:
 * - Replicate API for real AI upscaling (Real-ESRGAN)
 * - Canvas-based enhancement filters
 * - Fallback to simulated processing when API key is not available
 */

export interface UpscaleOptions {
  scale: 2 | 4
  quality: 'fast' | 'balanced' | 'quality'
  model?: string
}

export interface EnhancementOptions {
  noiseReduction: number
  sharpening: number
  brightness: number
  contrast: number
  saturation: number
}

export interface AIProcessingProgress {
  current: number
  total: number
  percentage: number
  status: 'idle' | 'processing' | 'completed' | 'error' | 'cancelled'
  message?: string
  eta?: number
}

export interface AIProcessingResult {
  success: boolean
  data?: Blob | string
  error?: string
  duration: number
  metadata?: {
    originalSize?: { width: number; height: number }
    newSize?: { width: number; height: number }
    model?: string
  }
}

export interface AIService {
  initialize(): Promise<void>
  upscale(image: Blob | string, options: UpscaleOptions): Promise<AIProcessingResult>
  enhance(image: Blob | string, options: EnhancementOptions): Promise<AIProcessingResult>
  cancel(): void
  isAvailable(): boolean
}

/**
 * Configuration for Replicate API
 */
const REPLICATE_CONFIG = {
  // Real-ESRGAN model for upscaling
  defaultModel: 'xinntao/realesrgan:84b9a091d927287718888e7b6f9e7a1c4c7e1b0a',
  // Alternative high-quality model
  qualityModel: 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
  apiBaseUrl: 'https://api.replicate.com/v1',
  pollingInterval: 1000, // 1 second
  maxPollingTime: 300000, // 5 minutes
}

/**
 * ReplicateService - Real AI upscaling using Replicate API
 */
export class ReplicateService implements AIService {
  private apiKey: string
  private abortController: AbortController | null = null
  private progressCallback?: (progress: AIProcessingProgress) => void

  constructor(apiKey?: string, onProgress?: (progress: AIProcessingProgress) => void) {
    this.apiKey = apiKey || (import.meta as any).env?.VITE_REPLICATE_API_KEY || ''
    this.progressCallback = onProgress
  }

  /**
   * Initialize the service and validate API key
   */
  async initialize(): Promise<void> {
    if (!this.apiKey) {
      console.warn('Replicate API key not configured. AI upscaling will not be available.')
      return
    }

    try {
      // Validate API key by making a simple request
      await this.validateApiKey()
      this.reportProgress({
        current: 1,
        total: 1,
        percentage: 100,
        status: 'completed',
        message: 'Replicate API connected',
      })
    } catch (error) {
      console.error('Replicate API validation failed:', error)
      throw new Error('Invalid Replicate API key')
    }
  }

  /**
   * Validate API key
   */
  private async validateApiKey(): Promise<void> {
    const response = await fetch(`${REPLICATE_CONFIG.apiBaseUrl}/models`, {
      headers: {
        Authorization: `Token ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`API validation failed: ${response.statusText}`)
    }
  }

  /**
   * Upscale an image using Replicate API
   */
  async upscale(
    image: Blob | string,
    options: UpscaleOptions
  ): Promise<AIProcessingResult> {
    const startTime = performance.now()
    this.abortController = new AbortController()

    this.reportProgress({
      current: 0,
      total: 100,
      percentage: 0,
      status: 'processing',
      message: 'Preparing image for upscaling...',
    })

    try {
      // Convert image to base64 if it's a blob
      let imageData: string
      if (image instanceof Blob) {
        imageData = await this.blobToBase64(image)
      } else {
        imageData = image
      }

      this.reportProgress({
        current: 10,
        total: 100,
        percentage: 10,
        status: 'processing',
        message: 'Sending to Replicate API...',
      })

      // Call Replicate API
      const result = await this.callReplicateAPI(imageData, options)

      this.reportProgress({
        current: 90,
        total: 100,
        percentage: 90,
        status: 'processing',
        message: 'Downloading upscaled image...',
      })

      // Fetch the upscaled image
      const upscaledBlob = await this.fetchImage(result.output)

      // Cleanup if image was a blob
      if (image instanceof Blob) {
        // Original blob will be garbage collected
      }

      this.reportProgress({
        current: 100,
        total: 100,
        percentage: 100,
        status: 'completed',
        message: 'Upscaling complete',
      })

      return {
        success: true,
        data: upscaledBlob,
        duration: performance.now() - startTime,
        metadata: {
          model: options.model || 'realesrgan',
          newSize: {
            width: 0, // Will be determined from result
            height: 0,
          },
        },
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Upscaling cancelled',
          duration: performance.now() - startTime,
        }
      }

      console.error('Upscaling error:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upscaling failed',
        duration: performance.now() - startTime,
      }
    } finally {
      this.abortController = null
    }
  }

  /**
   * Enhance an image using canvas-based filters
   */
  async enhance(
    image: Blob | string,
    options: EnhancementOptions
  ): Promise<AIProcessingResult> {
    const startTime = performance.now()
    this.abortController = new AbortController()

    this.reportProgress({
      current: 0,
      total: 100,
      percentage: 0,
      status: 'processing',
      message: 'Applying enhancements...',
    })

    try {
      // For enhancement, we use canvas-based processing
      // This is faster and doesn't require API calls
      const enhancedBlob = await this.applyCanvasEnhancements(image, options)

      this.reportProgress({
        current: 100,
        total: 100,
        percentage: 100,
        status: 'completed',
        message: 'Enhancement complete',
      })

      return {
        success: true,
        data: enhancedBlob,
        duration: performance.now() - startTime,
        metadata: {
          model: 'canvas-enhancement',
        },
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Enhancement cancelled',
          duration: performance.now() - startTime,
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Enhancement failed',
        duration: performance.now() - startTime,
      }
    } finally {
      this.abortController = null
    }
  }

  /**
   * Apply enhancements using HTML5 Canvas
   */
  private async applyCanvasEnhancements(
    image: Blob | string,
    options: EnhancementOptions
  ): Promise<Blob> {
    // Load image
    const img = await this.loadImage(image)

    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // Apply CSS filters
    const filters = []
    
    // Brightness (default 100, range 0-200)
    const brightness = 100 + (options.brightness || 0)
    filters.push(`brightness(${brightness}%)`)

    // Contrast (default 100, range 0-200)
    const contrast = 100 + (options.contrast || 0)
    filters.push(`contrast(${contrast}%)`)

    // Saturation (default 100, range 0-200)
    const saturation = 100 + (options.saturation || 0) * 2
    filters.push(`saturate(${saturation}%)`)

    ctx.filter = filters.join(' ')
    ctx.drawImage(img, 0, 0)
    ctx.filter = 'none'

    // Apply sharpening if specified
    if (options.sharpening > 0) {
      this.applySharpening(ctx, canvas.width, canvas.height, options.sharpening)
    }

    // Apply noise reduction if specified
    if (options.noiseReduction > 0) {
      this.applyNoiseReduction(ctx, canvas.width, canvas.height, options.noiseReduction)
    }

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create enhanced image'))
          }
        },
        'image/png'
      )
    })
  }

  /**
   * Apply sharpening filter
   */
  private applySharpening(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    amount: number
  ): void {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const original = new Uint8ClampedArray(data)

    const strength = amount / 100
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0

          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c
              const kernelIdx = (ky + 1) * 3 + (kx + 1)
              sum += original[idx] * kernel[kernelIdx]
            }
          }

          const idx = (y * width + x) * 4 + c
          data[idx] = this.clamp(original[idx] + (sum - original[idx]) * strength)
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * Apply simple noise reduction
   */
  private applyNoiseReduction(
    ctx: CanvasRenderingContext2D,
    _width: number,
    _height: number,
    amount: number
  ): void {
    // Simple blur-based noise reduction
    ctx.filter = `blur(${amount / 50}px)`
    const tempCanvas = ctx.canvas.cloneNode() as HTMLCanvasElement
    const tempCtx = tempCanvas.getContext('2d')
    if (tempCtx) {
      tempCtx.drawImage(ctx.canvas, 0, 0)
      ctx.filter = 'none'
      ctx.drawImage(tempCanvas, 0, 0)
    }
  }

  /**
   * Call Replicate API for upscaling
   */
  private async callReplicateAPI(
    imageData: string,
    options: UpscaleOptions
  ): Promise<any> {
    // Select version based on quality setting
    let version: string
    switch (options.quality) {
      case 'quality':
        version = REPLICATE_CONFIG.qualityModel
        break
      case 'fast':
        version = REPLICATE_CONFIG.defaultModel
        break
      default: // balanced
        version = REPLICATE_CONFIG.defaultModel
    }

    // Create prediction
    const createResponse = await fetch(`${REPLICATE_CONFIG.apiBaseUrl}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version,
        input: {
          image: imageData,
          scale: options.scale,
          face_enhance: false,
        },
      }),
      signal: this.abortController?.signal,
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}))
      throw new Error(`API error: ${createResponse.statusText} - ${JSON.stringify(errorData)}`)
    }

    const prediction = await createResponse.json()

    this.reportProgress({
      current: 20,
      total: 100,
      percentage: 20,
      status: 'processing',
      message: 'Processing on Replicate...',
      eta: 30,
    })

    // Poll for result
    return await this.pollForResult(prediction.id)
  }

  /**
   * Poll Replicate API for prediction result
   */
  private async pollForResult(predictionId: string): Promise<any> {
    const startTime = Date.now()

    while (true) {
      if (this.abortController?.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      // Check timeout
      if (Date.now() - startTime > REPLICATE_CONFIG.maxPollingTime) {
        throw new Error('Upscaling timed out')
      }

      const response = await fetch(`${REPLICATE_CONFIG.apiBaseUrl}/predictions/${predictionId}`, {
        headers: {
          Authorization: `Token ${this.apiKey}`,
        },
        signal: this.abortController?.signal,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const prediction = await response.json()

      if (prediction.status === 'succeeded') {
        return prediction
      }

      if (prediction.status === 'failed') {
        throw new Error(`Processing failed: ${prediction.error || 'Unknown error'}`)
      }

      if (prediction.status === 'canceled') {
        throw new DOMException('Aborted', 'AbortError')
      }

      // Update progress
      const progress = prediction.progress || 0
      this.reportProgress({
        current: 20 + Math.floor(progress * 0.7),
        total: 100,
        percentage: 20 + progress * 0.7,
        status: 'processing',
        message: `Processing: ${Math.round(progress)}%`,
      })

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, REPLICATE_CONFIG.pollingInterval))
    }
  }

  /**
   * Fetch image from URL and convert to blob
   */
  private async fetchImage(url: string): Promise<Blob> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    return await response.blob()
  }

  /**
   * Convert blob to base64 data URL
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Load image from blob or data URL
   */
  private loadImage(image: Blob | string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))

      if (image instanceof Blob) {
        img.src = URL.createObjectURL(image)
        img.onload = () => {
          URL.revokeObjectURL(img.src)
          resolve(img)
        }
      } else {
        img.src = image
      }
    })
  }

  /**
   * Clamp value between 0 and 255
   */
  private clamp(value: number): number {
    return Math.max(0, Math.min(255, value))
  }

  cancel(): void {
    this.abortController?.abort()
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  private reportProgress(progress: AIProcessingProgress): void {
    this.progressCallback?.(progress)
  }
}

/**
 * SimulatedAIService - For development/testing without API key
 */
export class SimulatedAIService implements AIService {
  private abortController: AbortController | null = null
  private progressCallback?: (progress: AIProcessingProgress) => void

  constructor(onProgress?: (progress: AIProcessingProgress) => void) {
    this.progressCallback = onProgress
  }

  async initialize(): Promise<void> {
    // No initialization needed
    this.reportProgress({
      current: 1,
      total: 1,
      percentage: 100,
      status: 'completed',
      message: 'Simulated AI service ready',
    })
  }

  async upscale(
    image: Blob | string,
    options: UpscaleOptions
  ): Promise<AIProcessingResult> {
    const startTime = performance.now()
    this.abortController = new AbortController()

    this.reportProgress({
      current: 0,
      total: 100,
      percentage: 0,
      status: 'processing',
      message: 'Simulating AI upscaling...',
    })

    // Simulate processing time based on scale and quality
    const baseTime = options.scale === 4 ? 3000 : 2000
    const qualityMultiplier = options.quality === 'quality' ? 1.5 : options.quality === 'fast' ? 0.7 : 1
    const processingTime = baseTime * qualityMultiplier

    // Simulate progress
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / processingTime) * 100, 99)
      this.reportProgress({
        current: Math.floor(progress),
        total: 100,
        percentage: progress,
        status: 'processing',
        message: `Simulating upscaling: ${Math.round(progress)}%`,
        eta: Math.ceil((processingTime - elapsed) / 1000),
      })
    }, 200)

    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, processingTime)
        this.abortController?.signal.addEventListener('abort', () => {
          clearTimeout(timeout)
          clearInterval(progressInterval)
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })

      clearInterval(progressInterval)

      // Return original image (in production, this would be upscaled)
      const resultBlob = image instanceof Blob ? image : new Blob()

      this.reportProgress({
        current: 100,
        total: 100,
        percentage: 100,
        status: 'completed',
        message: 'Upscaling complete (simulated)',
      })

      return {
        success: true,
        data: resultBlob,
        duration: performance.now() - startTime,
        metadata: {
          originalSize: { width: 1920, height: 1080 },
          newSize: {
            width: 1920 * options.scale,
            height: 1080 * options.scale,
          },
          model: 'simulated-realesrgan',
        },
      }
    } catch (error) {
      clearInterval(progressInterval)

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Upscaling cancelled',
          duration: performance.now() - startTime,
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upscaling failed',
        duration: performance.now() - startTime,
      }
    } finally {
      this.abortController = null
    }
  }

  async enhance(
    image: Blob | string,
    _options: EnhancementOptions
  ): Promise<AIProcessingResult> {
    const startTime = performance.now()
    this.abortController = new AbortController()

    this.reportProgress({
      current: 0,
      total: 100,
      percentage: 0,
      status: 'processing',
      message: 'Simulating enhancement...',
    })

    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 1000)
        this.abortController?.signal.addEventListener('abort', () => {
          clearTimeout(timeout)
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })

      const resultBlob = image instanceof Blob ? image : new Blob()

      this.reportProgress({
        current: 100,
        total: 100,
        percentage: 100,
        status: 'completed',
        message: 'Enhancement complete (simulated)',
      })

      return {
        success: true,
        data: resultBlob,
        duration: performance.now() - startTime,
        metadata: {
          model: 'simulated-enhancement',
        },
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Enhancement cancelled',
          duration: performance.now() - startTime,
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Enhancement failed',
        duration: performance.now() - startTime,
      }
    } finally {
      this.abortController = null
    }
  }

  cancel(): void {
    this.abortController?.abort()
  }

  isAvailable(): boolean {
    return true
  }

  private reportProgress(progress: AIProcessingProgress): void {
    this.progressCallback?.(progress)
  }
}

/**
 * Factory function to create appropriate AI service
 */
export function createAIService(onProgress?: (progress: AIProcessingProgress) => void): AIService {
  const apiKey = (import.meta as any).env?.VITE_REPLICATE_API_KEY

  if (apiKey && apiKey !== 'your_replicate_api_key_here') {
    return new ReplicateService(apiKey, onProgress)
  }

  // Fall back to simulated service for development
  console.log('Using simulated AI service. Set VITE_REPLICATE_API_KEY for real AI upscaling.')
  return new SimulatedAIService(onProgress)
}

/**
 * Validate environment configuration
 */
export function validateAIConfig(): { valid: boolean; message: string } {
  const apiKey = (import.meta as any).env?.VITE_REPLICATE_API_KEY

  if (!apiKey) {
    return {
      valid: false,
      message: 'VITE_REPLICATE_API_KEY not set. Using simulated AI service.',
    }
  }

  if (apiKey === 'your_replicate_api_key_here') {
    return {
      valid: false,
      message: 'Please set a valid Replicate API key in your .env file.',
    }
  }

  return {
    valid: true,
    message: 'Replicate API configured successfully.',
  }
}
