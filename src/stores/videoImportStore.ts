import { create } from 'zustand'
import { VideoFile, VideoUploadState, ValidationOptions, validateVideoFile } from '@/types/video'

interface VideoImportState extends VideoUploadState {
  // Additional state
  isInitializing: boolean
  supportedFormats: string[]
  maxFileSize: number

  // Actions
  setFile: (file: File) => Promise<void>
  clearFile: () => void
  setUploadProgress: (progress: number) => void
  setError: (error: string) => void
  clearError: () => void
  validate: (file: File, options?: ValidationOptions) => { valid: boolean; errors: string[] }
  getMetadata: (file: File) => Promise<Partial<VideoFile>>
  getVideoInfo: (file: File) => Promise<{
    duration: number
    width: number
    height: number
    fps: number
  }>
}

export const useVideoImportStore = create<VideoImportState>()((set, get) => ({
  // Initial state
  file: null,
  isUploading: false,
  isInitializing: false,
  uploadProgress: 0,
  error: null,
  isValid: false,
  validationErrors: [],
  supportedFormats: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
  maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB

  // Actions
  setFile: async (file: File) => {
    set({ 
      isUploading: true, 
      uploadProgress: 0, 
      error: null,
      isInitializing: true,
    })

    try {
      // Validate file
      const validation = get().validate(file)
      if (!validation.valid) {
        set({
          error: validation.errors.join('. '),
          validationErrors: validation.errors,
          isValid: false,
          isUploading: false,
          isInitializing: false,
        })
        return
      }

      // Simulate loading progress
      const progressInterval = setInterval(() => {
        set((state) => {
          const newProgress = Math.min(state.uploadProgress + 15, 85)
          return { uploadProgress: newProgress }
        })
      }, 100)

      // Create video element to get full metadata
      const videoInfo = await get().getVideoInfo(file)

      clearInterval(progressInterval)

      // Create video file object
      const videoFile: VideoFile = {
        id: crypto.randomUUID(),
        name: file.name,
        path: URL.createObjectURL(file),
        file,
        duration: videoInfo.duration,
        width: videoInfo.width,
        height: videoInfo.height,
        fps: videoInfo.fps,
        codec: 'unknown', // Would need ffprobe for actual codec detection
        size: file.size,
        format: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        thumbnail: undefined, // Could generate thumbnail here
      }

      set({
        file: videoFile,
        isValid: true,
        validationErrors: [],
        uploadProgress: 100,
        isUploading: false,
        isInitializing: false,
      })
    } catch (error) {
      console.error('Error loading video file:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to load video',
        isValid: false,
        isUploading: false,
        isInitializing: false,
        uploadProgress: 0,
      })
    }
  },

  clearFile: () => {
    // Revoke object URL to free memory
    const currentFile = get().file
    if (currentFile?.path && currentFile.path.startsWith('blob:')) {
      URL.revokeObjectURL(currentFile.path)
    }
    set({
      file: null,
      isUploading: false,
      isInitializing: false,
      uploadProgress: 0,
      error: null,
      isValid: false,
      validationErrors: [],
    })
  },

  setUploadProgress: (progress: number) => {
    set({ uploadProgress: Math.max(0, Math.min(100, progress)) })
  },

  setError: (error: string) => {
    set({ error, isValid: false })
  },

  clearError: () => {
    set({ error: null })
  },

  validate: (file: File, options?: ValidationOptions) => {
    const validationOptions = options || {
      maxSize: get().maxFileSize,
      allowedFormats: get().supportedFormats,
    }
    
    const validation = validateVideoFile(file, validationOptions)
    set({
      isValid: validation.valid,
      validationErrors: validation.errors,
    })
    return validation
  },

  getMetadata: async (file: File): Promise<Partial<VideoFile>> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = URL.createObjectURL(file)

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        })
      }

      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        resolve({})
      }
    })
  },

  getVideoInfo: async (file: File): Promise<{
    duration: number
    width: number
    height: number
    fps: number
  }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'auto'
      video.src = URL.createObjectURL(file)

      const timeout = setTimeout(() => {
        URL.revokeObjectURL(video.src)
        resolve({
          duration: 0,
          width: 0,
          height: 0,
          fps: 30, // Default fallback
        })
      }, 10000) // 10 second timeout

      video.onloadedmetadata = () => {
        clearTimeout(timeout)
        URL.revokeObjectURL(video.src)
        
        // Estimate FPS (actual FPS requires ffprobe)
        // Most videos are 24, 25, 30, or 60 fps
        let estimatedFps = 30
        if (video.duration > 0) {
          // This is a rough estimate based on common frame rates
          estimatedFps = 30 // Default to 30fps
        }

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
  },
}))

/**
 * Utility function to format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Utility function to format duration
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

/**
 * Check if a file is a supported video format
 */
export function isSupportedVideoFile(file: File): boolean {
  if (!file.type.startsWith('video/')) {
    return false
  }

  const extension = file.name.split('.').pop()?.toLowerCase()
  const supportedExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'wmv', 'flv']
  
  return extension ? supportedExtensions.includes(extension) : false
}
