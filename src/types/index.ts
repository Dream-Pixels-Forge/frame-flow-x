export interface Frame {
  id: string
  path: string
  timestamp: number
  frameNumber: number
  width: number
  height: number
  format: 'png' | 'jpeg' | 'webp'
  size: number
  isFavorite?: boolean
  rating?: number
}

export interface VideoFile {
  id: string
  name: string
  path: string
  duration: number
  width: number
  height: number
  fps: number
  codec: string
  size: number
  format: string
}

export interface ProcessingProgress {
  current: number
  total: number
  percentage: number
  eta?: number
  status: 'idle' | 'processing' | 'completed' | 'error' | 'cancelled' | 'paused'
  message?: string
}

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

export interface CinematicPreset {
  id: string
  name: string
  description: string
  category: 'warm' | 'cool' | 'bw' | 'vintage' | 'modern' | 'other'
  settings: PresetSettings
  isCustom?: boolean
  thumbnail?: string
}

export interface PresetSettings {
  temperature: number
  tint: number
  exposure: number
  contrast: number
  highlights: number
  shadows: number
  whites: number
  blacks: number
  saturation: number
  vibrance: number
  grain: number
  vignette: number
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  video?: VideoFile
  frames: Frame[]
  selectedFrameIds: string[]
  favoriteFrameIds: string[]
  exportSettings: ExportSettings
}

export interface ExportSettings {
  format: 'png' | 'jpeg' | 'webp' | 'tiff'
  quality: number
  resolution?: {
    width: number
    height: number
  }
  namingPattern: string
  zipExport: boolean
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppState {
  currentRoute: string
  isProcessing: boolean
  error: string | null
}
