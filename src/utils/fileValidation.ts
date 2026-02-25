import { VIDEO_CONFIG } from '@/config'

export interface FileValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  fileInfo?: {
    name: string
    size: number
    type: string
    duration?: number
    resolution?: { width: number; height: number }
  }
}

export interface ValidationOptions {
  maxSize?: number
  allowedFormats?: string[]
  checkCorruption?: boolean
  requireMetadata?: boolean
}

const DEFAULT_VALIDATION: ValidationOptions = {
  maxSize: VIDEO_CONFIG.maxFileSize,
  allowedFormats: [...VIDEO_CONFIG.supportedFormats],
  checkCorruption: true,
  requireMetadata: false,
}

/**
 * Validate video file format, size, and integrity
 */
export function validateVideoFile(
  file: File,
  options: ValidationOptions = DEFAULT_VALIDATION
): FileValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const validationOptions = { ...DEFAULT_VALIDATION, ...options }

  // Check file size
  if (validationOptions.maxSize && file.size > validationOptions.maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
    const maxMB = (validationOptions.maxSize / (1024 * 1024)).toFixed(0)
    errors.push(`File size (${sizeMB}MB) exceeds maximum allowed size (${maxMB}MB)`)
  }

  // Check file format
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension) {
    errors.push('File has no extension')
  } else if (
    validationOptions.allowedFormats &&
    !validationOptions.allowedFormats.includes(extension)
  ) {
    errors.push(
      `Format .${extension} is not supported. Supported formats: ${validationOptions.allowedFormats.join(', ')}`
    )
  }

  // Check file type
  if (!file.type.startsWith('video/')) {
    errors.push('File is not a valid video file')
  }

  // Check for corruption indicators
  if (validationOptions.checkCorruption) {
    const corruptionChecks = checkFileCorruption(file)
    errors.push(...corruptionChecks.errors)
    warnings.push(...corruptionChecks.warnings)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
    },
  }
}

/**
 * Check for file corruption indicators
 */
function checkFileCorruption(file: File): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if file size is 0
  if (file.size === 0) {
    errors.push('File is empty (0 bytes)')
    return { errors, warnings }
  }

  // Check if file size is suspiciously small (< 1KB for video)
  if (file.size < 1024) {
    warnings.push('File size is suspiciously small (< 1KB)')
  }

  // Check file header (magic bytes) for common video formats
  const reader = new FileReader()
  reader.onload = (e) => {
    const buffer = e.target?.result as ArrayBuffer
    if (buffer) {
      const headerValid = validateVideoHeader(buffer)
      if (!headerValid.valid) {
        errors.push(...headerValid.errors)
      }
      if (headerValid.warnings.length > 0) {
        warnings.push(...headerValid.warnings)
      }
    }
  }
  reader.readAsArrayBuffer(file.slice(0, 12)) // Read first 12 bytes

  return { errors, warnings }
}

/**
 * Validate video file header (magic bytes)
 */
function validateVideoHeader(buffer: ArrayBuffer): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  const bytes = new Uint8Array(buffer)

  if (bytes.length < 4) {
    errors.push('File too small to contain valid video header')
    return { valid: false, errors, warnings }
  }

  // Check for common video format signatures
  const signatures: Record<string, number[]> = {
    MP4: [0x00, 0x00, 0x00], // ftyp
    WebM: [0x1a, 0x45, 0xdf, 0xa3], // EBML
    AVI: [0x52, 0x49, 0x46, 0x46], // RIFF
    MKV: [0x1a, 0x45, 0xdf, 0xa3], // Same as WebM
  }

  const hasValidSignature = Object.values(signatures).some((sig) =>
    sig.every((byte, index) => bytes[index] === byte)
  )

  if (!hasValidSignature) {
    warnings.push('File header does not match known video format signatures')
  }

  return { valid: true, errors, warnings }
}

/**
 * Get video metadata using HTML5 video element
 */
export async function getVideoMetadata(file: File): Promise<{
  duration: number
  width: number
  height: number
  fps: number
  codec?: string
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = URL.createObjectURL(file)

    const timeout = setTimeout(() => {
      URL.revokeObjectURL(video.src)
      reject(new Error('Timeout loading video metadata'))
    }, 10000)

    video.onloadedmetadata = () => {
      clearTimeout(timeout)
      URL.revokeObjectURL(video.src)

      // Estimate FPS (actual FPS requires ffprobe)
      let estimatedFps = 30
      // Could use more sophisticated detection here

      resolve({
        duration: video.duration || 0,
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
        fps: estimatedFps,
      })
    }

    video.onerror = () => {
      clearTimeout(timeout)
      URL.revokeObjectURL(video.src)
      reject(new Error('Failed to load video metadata'))
    }
  })
}

/**
 * Check if a file is a supported video format
 */
export function isSupportedVideoFile(file: File): boolean {
  if (!file.type.startsWith('video/')) {
    return false
  }

  const extension = file.name.split('.').pop()?.toLowerCase()
  const supportedExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv']

  return extension ? supportedExtensions.includes(extension) : false
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
