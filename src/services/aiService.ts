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

export class ReplicateService implements AIService {
  private apiKey: string
  private abortController: AbortController | null = null

  constructor(apiKey?: string) {
    this.apiKey = apiKey || (import.meta as any).env?.VITE_REPLICATE_API_KEY || ''
  }

  async initialize(): Promise<void> {
    // No initialization needed for REST API
    if (!this.apiKey) {
      console.warn('Replicate API key not configured')
    }
  }

  async upscale(
    image: Blob | string,
    options: UpscaleOptions
  ): Promise<AIProcessingResult> {
    const startTime = performance.now()
    this.abortController = new AbortController()

    try {
      // Convert image to URL if it's a blob
      const imageUrl = image instanceof Blob ? URL.createObjectURL(image) : image

      // Call Replicate API
      const response = await this.callReplicateAPI(imageUrl, options)
      
      // Cleanup blob URL
      if (image instanceof Blob) {
        URL.revokeObjectURL(imageUrl)
      }

      return {
        success: true,
        data: response.output,
        duration: performance.now() - startTime,
        metadata: {
          model: 'realesrgan',
        },
      }
    } catch (error) {
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
    // For MVP, enhancement is simulated
    // In production, implement actual enhancement algorithms
    const startTime = performance.now()

    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      success: true,
      data: image,
      duration: performance.now() - startTime,
    }
  }

  private async callReplicateAPI(
    imageUrl: string,
    options: UpscaleOptions
  ): Promise<any> {
    const model = 'xinntao/realesrgan:84b9a091d927287718888e7b6f9e7a1c4c7e1b0a'
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: model,
        input: {
          image: imageUrl,
          scale: options.scale,
          face_enhance: false,
        },
      }),
      signal: this.abortController?.signal,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const prediction = await response.json()

    // Poll for result
    return await this.pollForResult(prediction.id)
  }

  private async pollForResult(predictionId: string): Promise<any> {
    while (true) {
      if (this.abortController?.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${this.apiKey}`,
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
        throw new Error('Processing failed')
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  cancel(): void {
    this.abortController?.abort()
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }
}

// Simulated AI service for development/testing
export class SimulatedAIService implements AIService {
  private abortController: AbortController | null = null

  async initialize(): Promise<void> {
    // No initialization needed
  }

  async upscale(
    image: Blob | string,
    options: UpscaleOptions
  ): Promise<AIProcessingResult> {
    const startTime = performance.now()
    this.abortController = new AbortController()

    // Simulate processing time based on scale
    const processingTime = options.scale === 4 ? 3000 : 2000

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, processingTime)
      this.abortController?.signal.addEventListener('abort', () => {
        clearTimeout(timeout)
        reject(new DOMException('Aborted', 'AbortError'))
      })
    })

    // Return original image for MVP (in production, return upscaled)
    return {
      success: true,
      data: image instanceof Blob ? image : new Blob(),
      duration: performance.now() - startTime,
      metadata: {
        originalSize: { width: 1920, height: 1080 },
        newSize: { 
          width: 1920 * options.scale, 
          height: 1080 * options.scale 
        },
        model: 'simulated-realesrgan',
      },
    }
  }

  async enhance(
    image: Blob | string,
    _options: EnhancementOptions
  ): Promise<AIProcessingResult> {
    const startTime = performance.now()

    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      success: true,
      data: image instanceof Blob ? image : new Blob(),
      duration: performance.now() - startTime,
    }
  }

  cancel(): void {
    this.abortController?.abort()
  }

  isAvailable(): boolean {
    return true
  }
}

// Factory function to create AI service
export function createAIService(): AIService {
  const apiKey = (import.meta as any).env?.VITE_REPLICATE_API_KEY
  
  if (apiKey) {
    return new ReplicateService(apiKey)
  }
  
  // Fall back to simulated service for development
  return new SimulatedAIService()
}
