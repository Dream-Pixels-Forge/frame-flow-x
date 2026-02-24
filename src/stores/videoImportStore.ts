import { create } from 'zustand'
import { VideoFile, VideoUploadState, ValidationOptions, validateVideoFile } from '@/types/video'

interface VideoImportState extends VideoUploadState {
  // Actions
  setFile: (file: File) => Promise<void>
  clearFile: () => void
  setUploadProgress: (progress: number) => void
  setError: (error: string) => void
  validate: (file: File, options?: ValidationOptions) => boolean
  getMetadata: (file: File) => Promise<Partial<VideoFile>>
}

export const useVideoImportStore = create<VideoImportState>()((set, get) => ({
  // Initial state
  file: null,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  isValid: false,
  validationErrors: [],

  // Actions
  setFile: async (file: File) => {
    set({ isUploading: true, uploadProgress: 0, error: null })

    try {
      // Validate file
      const validation = validateVideoFile(file)
      if (!validation.valid) {
        set({
          error: validation.errors.join('. '),
          validationErrors: validation.errors,
          isValid: false,
          isUploading: false,
        })
        return
      }

      // Get metadata
      const metadata = await get().getMetadata(file)

      // Simulate upload progress (for local files, this is just loading)
      const progressInterval = setInterval(() => {
        set((state) => {
          const newProgress = Math.min(state.uploadProgress + 10, 90)
          return { uploadProgress: newProgress }
        })
      }, 100)

      // Create video element to get metadata
      const videoFile: VideoFile = {
        id: crypto.randomUUID(),
        name: file.name,
        path: URL.createObjectURL(file),
        file,
        duration: 0,
        width: 0,
        height: 0,
        fps: 0,
        codec: 'unknown',
        size: file.size,
        format: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        ...metadata,
      }

      // Wait for metadata
      await new Promise<void>((resolve) => {
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.src = videoFile.path

        video.onloadedmetadata = () => {
          videoFile.duration = video.duration
          videoFile.width = video.videoWidth
          videoFile.height = video.videoHeight
          videoFile.fps = 30 // Default, actual FPS requires ffprobe
          clearInterval(progressInterval)
          resolve()
        }

        video.onerror = () => {
          clearInterval(progressInterval)
          resolve()
        }
      })

      set({
        file: videoFile,
        isValid: true,
        validationErrors: [],
        uploadProgress: 100,
        isUploading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load video',
        isValid: false,
        isUploading: false,
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
      uploadProgress: 0,
      error: null,
      isValid: false,
      validationErrors: [],
    })
  },

  setUploadProgress: (progress: number) => {
    set({ uploadProgress: progress })
  },

  setError: (error: string) => {
    set({ error, isValid: false })
  },

  validate: (file: File, options?: ValidationOptions) => {
    const validation = validateVideoFile(file, options)
    set({
      isValid: validation.valid,
      validationErrors: validation.errors,
    })
    return validation.valid
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
}))
