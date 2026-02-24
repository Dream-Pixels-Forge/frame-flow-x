import { VIDEO_CONFIG } from '@/config'

export interface VideoFile {
  id: string
  name: string
  path: string
  file?: File
  duration: number
  width: number
  height: number
  fps: number
  codec: string
  size: number
  format: string
  thumbnail?: string
}

export interface VideoUploadState {
  file: VideoFile | null
  isUploading: boolean
  uploadProgress: number
  error: string | null
  isValid: boolean
  validationErrors: string[]
}

export interface ValidationOptions {
  maxSize?: number
  allowedFormats?: string[]
}

export const DEFAULT_VALIDATION: ValidationOptions = {
  maxSize: VIDEO_CONFIG.maxFileSize,
  allowedFormats: [...VIDEO_CONFIG.supportedFormats],
}

export function validateVideoFile(
  file: File,
  options: ValidationOptions = DEFAULT_VALIDATION
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const { maxSize, allowedFormats } = options

  // Check file size
  if (maxSize && file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
    const maxMB = (maxSize / (1024 * 1024)).toFixed(0)
    errors.push(`File size (${sizeMB}MB) exceeds maximum allowed size (${maxMB}MB)`)
  }

  // Check file format
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension && allowedFormats && !allowedFormats.includes(extension)) {
    errors.push(`Format .${extension} is not supported. Supported formats: ${allowedFormats.join(', ')}`)
  }

  // Check file type
  if (!file.type.startsWith('video/')) {
    errors.push('File is not a valid video file')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function formatVideoResolution(width: number, height: number): string {
  const resolutions: Record<string, string> = {
    '640x480': 'SD',
    '1280x720': 'HD',
    '1920x1080': 'FHD',
    '2560x1440': 'QHD',
    '3840x2160': '4K',
    '7680x4320': '8K',
  }
  const key = `${width}x${height}`
  return resolutions[key] || `${width}x${height}`
}

export function getVideoIcon(format: string): string {
  const icons: Record<string, string> = {
    mp4: '🎬',
    webm: '🌐',
    mov: '🍎',
    avi: '📼',
    mkv: '🎞️',
  }
  return icons[format.toLowerCase()] || '🎥'
}
