/**
 * Image Processing Utilities
 * 
 * Provides canvas-based image processing functions for enhancement filters,
 * format conversion, and basic image manipulation.
 */

export interface ImageProcessingOptions {
  brightness?: number      // -100 to 100
  contrast?: number        // -100 to 100
  saturation?: number      // -100 to 100
  hue?: number             // -180 to 180
  sharpening?: number      // 0 to 100
  noiseReduction?: number  // 0 to 100
  blur?: number            // 0 to 20
  vignette?: number        // 0 to 100
  grain?: number           // 0 to 100
  sepia?: number           // 0 to 100
  grayscale?: number       // 0 to 100
}

export interface ImageDimensions {
  width: number
  height: number
}

export interface ProcessedImage {
  blob: Blob
  width: number
  height: number
  format: string
}

/**
 * Apply enhancement filters to an image using HTML5 Canvas
 */
export async function applyEnhancements(
  imageBlob: Blob,
  options: ImageProcessingOptions
): Promise<ProcessedImage> {
  const bitmap = await createImageBitmap(imageBlob)
  const { width, height } = bitmap

  // Create canvas for processing
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Draw original image
  ctx.drawImage(bitmap, 0, 0)

  // Get image data for pixel manipulation
  let imageData = ctx.getImageData(0, 0, width, height)

  // Apply brightness
  if (options.brightness && options.brightness !== 0) {
    imageData = applyBrightness(imageData, options.brightness)
  }

  // Apply contrast
  if (options.contrast && options.contrast !== 0) {
    imageData = applyContrast(imageData, options.contrast)
  }

  // Apply saturation
  if (options.saturation && options.saturation !== 0) {
    imageData = applySaturation(imageData, options.saturation)
  }

  // Apply hue rotation
  if (options.hue && options.hue !== 0) {
    imageData = applyHueRotation(imageData, options.hue)
  }

  // Apply sharpening
  if (options.sharpening && options.sharpening > 0) {
    imageData = applySharpening(ctx, imageData, options.sharpening)
  }

  // Apply noise reduction
  if (options.noiseReduction && options.noiseReduction > 0) {
    imageData = applyNoiseReduction(imageData, options.noiseReduction)
  }

  // Put processed image data back
  ctx.putImageData(imageData, 0, 0)

  // Apply CSS filter effects (vignette, blur, etc.)
  if (options.vignette && options.vignette > 0) {
    applyVignette(ctx, width, height, options.vignette)
  }

  if (options.grain && options.grain > 0) {
    applyGrain(ctx, width, height, options.grain)
  }

  // Apply color tone filters
  if (options.sepia && options.sepia > 0) {
    applySepiaTone(ctx, options.sepia)
  }

  if (options.grayscale && options.grayscale > 0) {
    applyGrayscale(ctx, options.grayscale)
  }

  // Convert to blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      },
      'image/png',
      1.0
    )
  })

  bitmap.close()

  return {
    blob,
    width,
    height,
    format: 'png',
  }
}

/**
 * Apply brightness adjustment
 */
function applyBrightness(
  imageData: ImageData,
  brightness: number
): ImageData {
  const data = imageData.data
  const factor = brightness * 2.55 // Convert 0-100 to 0-255

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + factor)     // R
    data[i + 1] = clamp(data[i + 1] + factor) // G
    data[i + 2] = clamp(data[i + 2] + factor) // B
  }

  return imageData
}

/**
 * Apply contrast adjustment
 */
function applyContrast(
  imageData: ImageData,
  contrast: number
): ImageData {
  const data = imageData.data
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128)     // R
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128) // G
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128) // B
  }

  return imageData
}

/**
 * Apply saturation adjustment
 */
function applySaturation(
  imageData: ImageData,
  saturation: number
): ImageData {
  const data = imageData.data
  const factor = 1 + (saturation / 100)

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

    data[i] = clamp(gray + factor * (data[i] - gray))     // R
    data[i + 1] = clamp(gray + factor * (data[i + 1] - gray)) // G
    data[i + 2] = clamp(gray + factor * (data[i + 2] - gray)) // B
  }

  return imageData
}

/**
 * Apply hue rotation
 */
function applyHueRotation(
  imageData: ImageData,
  hue: number
): ImageData {
  const data = imageData.data
  const hueRad = (hue * Math.PI) / 180
  const cos = Math.cos(hueRad)
  const sin = Math.sin(hueRad)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Convert to YUV
    const y = 0.299 * r + 0.587 * g + 0.114 * b
    const u = -0.147 * r - 0.289 * g + 0.436 * b
    const v = 0.615 * r - 0.515 * g - 0.100 * b

    // Rotate hue
    const uRot = u * cos - v * sin
    const vRot = u * sin + v * cos

    // Convert back to RGB
    data[i] = clamp(y + 1.140 * vRot)
    data[i + 1] = clamp(y - 0.395 * uRot - 0.581 * vRot)
    data[i + 2] = clamp(y + 2.032 * uRot)
  }

  return imageData
}

/**
 * Apply sharpening filter using convolution
 */
function applySharpening(
  _ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  amount: number
): ImageData {
  const width = imageData.width
  const height = imageData.height
  const data = imageData.data

  // Create a copy of the original data
  const original = new Uint8ClampedArray(data)

  // Sharpening kernel
  const strength = amount / 100
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ]

  // Apply convolution
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
        data[idx] = clamp(original[idx] + (sum - original[idx]) * strength)
      }
    }
  }

  return imageData
}

/**
 * Apply noise reduction using simple averaging
 */
function applyNoiseReduction(
  imageData: ImageData,
  amount: number
): ImageData {
  const width = imageData.width
  const height = imageData.height
  const data = imageData.data

  // Create a copy of the original data
  const original = new Uint8ClampedArray(data)

  const radius = Math.ceil(amount / 25)

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0
        let count = 0

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4 + c
            sum += original[idx]
            count++
          }
        }

        const idx = (y * width + x) * 4 + c
        data[idx] = Math.round(sum / count)
      }
    }
  }

  return imageData
}

/**
 * Apply vignette effect
 */
function applyVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
): void {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.max(width, height) / 1.5
  )

  const opacity = amount / 100

  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, `rgba(0, 0, 0, ${opacity})`)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

/**
 * Apply film grain effect
 */
function applyGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
): void {
  const grainCanvas = document.createElement('canvas')
  grainCanvas.width = width
  grainCanvas.height = height
  const grainCtx = grainCanvas.getContext('2d')

  if (!grainCtx) return

  const imageData = grainCtx.createImageData(width, height)
  const data = imageData.data
  const intensity = (amount / 100) * 128

  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * intensity
    data[i] = grain     // R
    data[i + 1] = grain // G
    data[i + 2] = grain // B
    data[i + 3] = 50    // Alpha
  }

  grainCtx.putImageData(imageData, 0, 0)
  ctx.drawImage(grainCanvas, 0, 0)
}

/**
 * Apply sepia tone filter
 */
function applySepiaTone(
  ctx: CanvasRenderingContext2D,
  amount: number
): void {
  const opacity = amount / 100
  ctx.globalAlpha = opacity
  ctx.fillStyle = '#704214'
  ctx.globalCompositeOperation = 'overlay'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
}

/**
 * Apply grayscale filter
 */
function applyGrayscale(
  ctx: CanvasRenderingContext2D,
  amount: number
): void {
  const opacity = amount / 100
  ctx.filter = `grayscale(${opacity})`
  ctx.drawImage(ctx.canvas, 0, 0)
  ctx.filter = 'none'
}

/**
 * Clamp value between 0 and 255
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(255, value))
}

/**
 * Convert image blob to different format
 */
export async function convertImageFormat(
  imageBlob: Blob,
  format: 'png' | 'jpeg' | 'webp',
  quality: number = 0.95
): Promise<Blob> {
  const bitmap = await createImageBitmap(imageBlob)

  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // For JPEG, fill with white background
  if (format === 'jpeg') {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert image format'))
        }
      },
      `image/${format}`,
      quality
    )
  })
}

/**
 * Resize image to specified dimensions
 */
export async function resizeImage(
  imageBlob: Blob,
  dimensions: ImageDimensions,
  maintainAspectRatio: boolean = true
): Promise<ProcessedImage> {
  const bitmap = await createImageBitmap(imageBlob)

  let width = dimensions.width
  let height = dimensions.height

  if (maintainAspectRatio) {
    const aspectRatio = bitmap.width / bitmap.height
    const targetAspectRatio = width / height

    if (aspectRatio > targetAspectRatio) {
      height = width / aspectRatio
    } else {
      width = height * aspectRatio
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Use high-quality scaling
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to resize image'))
        }
      },
      'image/png'
    )
  })

  return {
    blob,
    width,
    height,
    format: 'png',
  }
}

/**
 * Extract frame data from video element at specific timestamp
 */
export async function extractFrameFromVideo(
  video: HTMLVideoElement,
  timestamp: number
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    video.currentTime = timestamp

    const handleSeeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(video, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              blob,
              width: video.videoWidth,
              height: video.videoHeight,
              format: 'png',
            })
          } else {
            reject(new Error('Failed to extract frame'))
          }
          video.removeEventListener('seeked', handleSeeked)
          video.removeEventListener('error', handleError)
        },
        'image/png'
      )
    }

    const handleError = () => {
      reject(new Error('Video error while extracting frame'))
      video.removeEventListener('seeked', handleSeeked)
      video.removeEventListener('error', handleError)
    }

    video.addEventListener('seeked', handleSeeked)
    video.addEventListener('error', handleError)
  })
}

/**
 * Batch process multiple images with the same enhancements
 */
export async function batchProcessImages(
  images: Blob[],
  options: ImageProcessingOptions,
  onProgress?: (current: number, total: number) => void
): Promise<ProcessedImage[]> {
  const results: ProcessedImage[] = []

  for (let i = 0; i < images.length; i++) {
    try {
      const result = await applyEnhancements(images[i], options)
      results.push(result)

      onProgress?.(i + 1, images.length)
    } catch (error) {
      console.error(`Failed to process image ${i + 1}:`, error)
      // Continue with next image
    }
  }

  return results
}

/**
 * Get image metadata from blob
 */
export async function getImageMetadata(
  imageBlob: Blob
): Promise<ImageDimensions & { format: string; size: number }> {
  const bitmap = await createImageBitmap(imageBlob)
  const dimensions = {
    width: bitmap.width,
    height: bitmap.height,
  }
  bitmap.close()

  return {
    ...dimensions,
    format: imageBlob.type.split('/')[1] || 'unknown',
    size: imageBlob.size,
  }
}
